import got from "got";
import { queryWikidata } from "./wikidata-query.js";

const queryRes = await queryWikidata(`
SELECT DISTINCT ?item ?itemLabel ?npmPackageName ?homepage ?versions WHERE {
  ?item wdt:P8262 ?npmPackageName.
  OPTIONAL { ?item wdt:P856 ?homepage. }
  OPTIONAL { ?item wdt:P348 ?versions. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
}

LIMIT 10
`);

function tabSeparatedList(...items: string[]): string {
  return items.join("\t");
}

function wikiDataDate(date: Date = new Date()): string {
  return `+${date.toISOString().split(".")[0]}/11`;
}

function sourceRetrievedFromNpm(packageName: string): string {
  return tabSeparatedList(
    "S854",
    `"https://registry.npmjs.org/${packageName}"`,
    "S813",
    wikiDataDate()
  );
}

async function quickstatementNpmPackage(
  packageName: string,
  wikidataId: string
): Promise<string> {
  const statements: string[] = [];

  const manifest = await got(
    `https://registry.npmjs.org/${packageName}`
  ).json();
  const homepage = (manifest as any).homepage;

  const versions = Object.keys((manifest as any).versions).map((version) =>
    tabSeparatedList(
      wikidataId,
      "P348",
      `"${version}"`,
      sourceRetrievedFromNpm(packageName)
    )
  );

  statements.push(...versions);

  if (homepage) {
    const homepageStatement = tabSeparatedList(
      wikidataId,
      "P856",
      `"${homepage}"`,
      sourceRetrievedFromNpm(packageName)
    );

    statements.push(homepageStatement);
  }

  return statements.join("\n");
}

for (const obj of (queryRes as any).results.bindings) {
  console.log(
    await quickstatementNpmPackage(
      obj.npmPackageName.value,
      obj.itemLabel.value
    )
  );
}
