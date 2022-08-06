import got from "got";
import { queryWikidata } from "./wikidata-query.js";
import stripIndent from "strip-indent";

const queryRes = await queryWikidata(`
SELECT DISTINCT ?item ?itemLabel ?npmPackageName ?homepage ?versions WHERE {
  ?item wdt:P8262 ?npmPackageName.
  OPTIONAL { ?item wdt:P856 ?homepage. }
  OPTIONAL { ?item wdt:P348 ?versions. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
}

LIMIT 10
`);

function wikiDataDate(date: Date = new Date()): string {
  return `+${date.toISOString().split(".")[0]}/11`;
}

function sourceRetrievedFromNpm(packageName: string): string {
  return `S854\t"https://registry.npmjs.org/${packageName}"\tS813\t${wikiDataDate()}`;
}

async function quickstatementNpmPackage(
  packageName: string,
  wikidataId: string
): Promise<string> {
  const manifest = await got(
    `https://registry.npmjs.org/${packageName}`
  ).json();
  const homepage = (manifest as any).homepage;

  const versions = Object.keys((manifest as any).versions).map((version) =>
    stripIndent(
      `${wikidataId}\tP348\t"${version}"\t${sourceRetrievedFromNpm(
        packageName
      )}`
    )
  );

  return stripIndent(`
  ${
    homepage
      ? stripIndent(
          `${wikidataId}\tP856\t"${homepage}"\t${sourceRetrievedFromNpm(
            packageName
          )}`
        )
      : ""
  }
  ${versions.join("\n")}
  `);
}

for (const obj of (queryRes as any).results.bindings) {
  console.log(
    await quickstatementNpmPackage(
      obj.npmPackageName.value,
      obj.itemLabel.value
    )
  );
}
