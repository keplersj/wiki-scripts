import inquirer from "inquirer";
import got from "got";
import wikidata from "wikidata-sdk";
import dotenv from "dotenv";
import wikibaseEditor from "wikibase-edit";
import util from "util";

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
      devDependencies: Object;
      dependencies: Object;
      peerDependencies: Object;
      stylelint: Object;
      eslintConfig: Object;
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

function npmPkgToWikiObject(pkg: RegistryPkg): WikiObject {
  return {
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
      P1324: {
        value: sanitizeUrl(pkg.repository.url),
        references: [
          {
            //reference URL
            P854: `https://cdn.jsdelivr.net/npm/${pkg.name}@${
              pkg.versions[Object.keys(pkg.versions).length - 1]
            }/package.json`,
            // retrieved
            P813: convertToWikiDate(new Date()),
          },
          {
            //reference URL
            P854: `https://unpkg.com/${pkg.name}@${
              pkg.versions[Object.keys(pkg.versions).length - 1]
            }/package.json`,
            // retrieved
            P813: convertToWikiDate(new Date()),
          },
        ],
      },
      // official website
      P856: {
        value: pkg.homepage,
        references: [
          {
            //reference URL
            P854: `https://cdn.jsdelivr.net/npm/${pkg.name}@${
              pkg.versions[Object.keys(pkg.versions).length - 1]
            }/package.json`,
            // retrieved
            P813: convertToWikiDate(new Date()),
          },
          {
            //reference URL
            P854: `https://unpkg.com/${pkg.name}@${
              pkg.versions[Object.keys(pkg.versions).length - 1]
            }/package.json`,
            // retrieved
            P813: convertToWikiDate(new Date()),
          },
        ],
      },
      // software version identifier
      P348: Object.values(pkg.versions).map(({ version }) => ({
        value: version,
        qualifiers: {
          //publication date
          P577: convertToWikiDate(new Date(pkg.time[version])),
        },
        references: [
          {
            //reference URL
            P854: `https://cdn.jsdelivr.net/npm/${pkg.name}@${version}/package.json`,
            //publication date
            P577: convertToWikiDate(new Date(pkg.time[version])),
            // retrieved
            P813: convertToWikiDate(new Date()),
          },
          {
            //reference URL
            P854: `https://unpkg.com/${pkg.name}@${version}/package.json`,
            //publication date
            P577: convertToWikiDate(new Date(pkg.time[version])),
            // retrieved
            P813: convertToWikiDate(new Date()),
          },
        ],
      })),
      P8262: pkg.name,
    },
  };
}

async function main() {
  const { pkgName } = await inquirer.prompt([
    {
      type: "input",
      name: "pkgName",
      message: "Name of NPM package to add to WikiData?",
    },
  ]);

  const matchesUrl = wikidata.sparqlQuery(`
    SELECT ?item ?itemLabel ?value WHERE {
        ?item wdt:P8262 ?value.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
       FILTER(?value = "${pkgName}").
    }
  `);

  const { body: matches } = await got.get<WikiDataQuery>(matchesUrl, {
    responseType: "json",
  });

  if (matches.results.bindings.length != 0) {
    console.error(
      `WikiData already contains object(s) with '${pkgName}' attached.`
    );
    return;
  }

  const { body: pkg } = await got.get<RegistryPkg>(
    `https://registry.npmjs.com/${pkgName}`,
    {
      responseType: "json",
    }
  );

  const wikiObject = npmPkgToWikiObject(pkg);

  if (process.env.DRY_RUN) {
    console.log(util.inspect(wikiObject, false, 10));
  } else {
    const { entity } = await wbEdit.entity.create(wikiObject);
    console.log("created item id", entity.id);
  }
}

main();
