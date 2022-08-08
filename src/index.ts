import got from "got";
import { queryWikidata } from "./wikidata-query.js";

const queryRes = await queryWikidata(`
SELECT DISTINCT ?item ?itemLabel ?npmPackageName WHERE {
  ?item wdt:P8262 ?npmPackageName.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
}

LIMIT 10
`);

function tabSeparatedList(...items: string[]): string {
  return items.join("\t");
}

function wikiDataDate(date: Date = new Date()): string {
  return `+${date.toISOString().split(".")[0]}Z/11`;
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

  const versions = Object.keys((manifest as any).versions).map((version) =>
    tabSeparatedList(
      wikidataId,
      "P348",
      `"${version}"`,
      "P577",
      wikiDataDate(new Date((manifest as any).time[version])),
      sourceRetrievedFromNpm(packageName)
    )
  );

  statements.push(...versions);

  const homepage = (manifest as any).homepage;

  if (homepage) {
    const homepageStatement = tabSeparatedList(
      wikidataId,
      "P856",
      `"${homepage}"`,
      sourceRetrievedFromNpm(packageName)
    );

    statements.push(homepageStatement);
  }

  const bugtracker = (manifest as any).bugs;

  if (bugtracker && bugtracker.url) {
    const bugtrackerStatement = tabSeparatedList(
      wikidataId,
      "P1401",
      `"${bugtracker.url}"`,
      sourceRetrievedFromNpm(packageName)
    );

    statements.push(bugtrackerStatement);
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
