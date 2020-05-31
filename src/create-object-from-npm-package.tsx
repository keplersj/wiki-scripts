import inquirer from "inquirer";
import got from "got";
import wikidata from "wikidata-sdk";
import dotenv from "dotenv";
import wikibaseEditor from "wikibase-edit";
import chalk from "chalk";

interface WikiDataQuery {
  head: { vars: ["item", "itemLabel", "value"] };
  results: {
    bindings: {
      item: {
        type: "uri";
        value: string;
      };
      value: { type: "literal"; value: string };
      itemLabel: { type: "literal"; value: string };
    }[];
  };
}

interface RegistryPkg {
  _id: string;
  _rev: string;
  name: string;
  "dist-tags": { latest: string };
  versions: {
    [version: string]: {
      name: string;
      version: string;
      description: string;
      main: string;
      scripts: Object;
      repository: Object;
      keywords: string[];
      author: object;
      license: string;
      bugs: object;
      homepage: string;
      devDependencies: { [pkgName: string]: string };
      dependencies: { [pkgName: string]: string };
      peerDependencies: { [pkgName: string]: string };
      gitHead: string;
      _id: string;
      _nodeVersion: string;
      _npmVersion: string;
      dist: Object;
      maintainers: [];
      _npmUser: Object;
      directories: Object;
      _npmOperationalInternal: Object;
      _hasShrinkwrap: boolean;
    };
  };
  time: { [version: string]: string };
  maintainers: { name: string; email: string }[];
  description: string;
  homepage: string;
  keywords: string[];
  repository: {
    type: string;
    url: string;
  };
  author: { name: string; email: string };
  bugs: { url: string };
  license: string;
  readme: string;
  readmeFilename: string;
}

interface WikiObject {
  // Wikibase Object ID
  id?: string;
  // All the rest is optional but one of labels, descriptions, aliases, claims, or sitelinks must be set
  labels?: {
    [lang: string]: string | { value: string; remove: boolean };
  };
  descriptions?: {
    [lang: string]: string | { value: string; remove: boolean };
  };
  aliases?: {
    // Pass aliases as an array
    [lang: string]: string | string[];
  };
  claims?: {
    [prop: string]: // Pass values as an array
    | string[]
      // Or a single value
      | number
      | string
      | {
          value: string;
          qualifiers?: {
            [prop: string]: string | string[] | object;
          };
          references?: { [prop: string]: string | object }[];
        }
      // Or a rich value object
      | { text: string; language: string }
      // Or even an array of mixed simple values and rich object values
      | (number | { amount: number; unit: string })[]
      // Add statements with special snaktypes ('novalue' or 'somevalue')
      | { snaktype: "novalue" | "somevalue" }
      // or special rank (Default: 'normal'. Possible values: 'preferred' or 'deprecated')
      | { rank: string; value: number }
      // Add qualifiers and references to value objects
      | {
          value: string;
          qualifiers?: {
            [prop: string]: string | string[] | object;
          };
          references?: { [prop: string]: string | object }[];
        }[];
  };
  sitelinks?: {
    [lang: string]: string | { value: string; remove: boolean };
  };
}

const envResult = dotenv.config();

if (envResult.error) {
  console.error(envResult);
  process.exit(1);
}

const wbEdit = wikibaseEditor({
  instance: "https://www.wikidata.org",
  credentials: {
    username: process.env.WIKIBASE_USERNAME,
    password: process.env.WIKIBASE_PASSWORD,
  },
});

function sanitizeUrl(url: string): string {
  return url.replace("git+", "");
}

function convertToWikiDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function hostPackageJsons(pkgName: string, version: string): string[] {
  return [
    `https://cdn.jsdelivr.net/npm/${pkgName}@${version}/package.json`,
    `https://unpkg.com/${pkgName}@${version}/package.json`,
  ];
}

async function npmToWikiData(pkgName: string): Promise<string> {
  const matchesUrl = wikidata.sparqlQuery(`
    SELECT ?item ?itemLabel ?value WHERE {
        ?item wdt:P8262 ?value.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
       FILTER(?value = "${pkgName}").
    }
  `);

  const { body: matches } = await got.get<WikiDataQuery>(matchesUrl, {
    responseType: "json",
    headers: { Accept: "application/sparql-results+json" },
  });

  if (matches.results.bindings.length != 0) {
    const splitMatch = matches.results.bindings[0].item.value.split("/");
    const match = splitMatch[splitMatch.length - 1];
    console.log(chalk.yellow(`Found entity ${match} (${pkgName})`));
    return match;
  } else {
    console.log(chalk.red(`No entity for ${pkgName}`));
  }

  const { body: pkg } = await got.get<RegistryPkg>(
    `https://registry.npmjs.com/${pkgName}`,
    {
      responseType: "json",
    }
  );

  const deps = Object.keys(
    pkg.versions[pkg["dist-tags"].latest].dependencies || {}
  ).concat(
    Object.keys(pkg.versions[pkg["dist-tags"].latest].peerDependencies || {})
  );

  const wikiObject = {
    labels: {
      en: pkg.name,
    },
    descriptions: {
      en: pkg.description,
    },
    claims: {
      // assume an instance of 'JavaScript library'
      P31: "Q783866",
      // source code repository
      P1324: pkg.repository &&
        pkg.repository.url && {
          value: sanitizeUrl(pkg.repository.url),
          references: hostPackageJsons(
            pkg.name,
            Object.keys(pkg.versions)[Object.keys(pkg.versions).length - 1]
          ).map((url) => ({
            //reference URL
            P854: url,
            // retrieved
            P813: convertToWikiDate(new Date()),
          })),
        },
      // official website
      P856: pkg.homepage && {
        value: pkg.homepage,
        references: hostPackageJsons(
          pkg.name,
          Object.keys(pkg.versions)[Object.keys(pkg.versions).length - 1]
        ).map((url) => ({
          //reference URL
          P854: url,
          // retrieved
          P813: convertToWikiDate(new Date()),
        })),
      },
      //depends on software
      P1547: await Promise.all(
        // recursively finds (and creates if needed) WikiData objects for direct and peer deps
        deps.map(async (dep) => {
          const wikidataObject = await npmToWikiData(dep);
          return {
            value: wikidataObject,
            references: hostPackageJsons(
              pkg.name,
              Object.keys(pkg.versions)[Object.keys(pkg.versions).length - 1]
            ).map((url) => ({
              //reference URL
              P854: url,
              // retrieved
              P813: convertToWikiDate(new Date()),
            })),
          };
        })
      ),
      // software version identifier
      P348: Object.values(pkg.versions).map(({ version }) => ({
        value: version,
        qualifiers: {
          //publication date
          P577: convertToWikiDate(new Date(pkg.time[version])),
        },
        references: hostPackageJsons(pkg.name, version).map((url) => ({
          //reference URL
          P854: url,
          //publication date
          P577: convertToWikiDate(new Date(pkg.time[version])),
          // retrieved
          P813: convertToWikiDate(new Date()),
        })),
      })),
      P8262: pkg.name,
    },
  };

  const { entity } = await wbEdit.entity.create(wikiObject);
  console.log(chalk.green(`Created entity ${entity.id} (${pkg.name})`));
  return entity.id;
}

async function main() {
  const { pkgName } = await inquirer.prompt([
    {
      type: "input",
      name: "pkgName",
      message: "Name of NPM package to add to WikiData?",
    },
  ]);

  await npmToWikiData(pkgName);
}

main();
