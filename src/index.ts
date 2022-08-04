import got from "got";
import { queryWikidata } from "./wikidata-query.js";

const queryRes = await queryWikidata(`
SELECT DISTINCT ?item ?itemLabel ?npmPackageName WHERE {
  ?item wdt:P8262 ?npmPackageName.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
}
`);

function wikiDataDate(date: Date): string {
  return `+${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}T00:00:00Z/11`;
}

async function quickstatementNpmPackage(
  packageName: string,
  wikidataId: string
): Promise<string> {
  const manifest = await got(
    `https://registry.npmjs.org/${packageName}`
  ).json();
  const homepage = (manifest as any).homepage;

  if (!homepage) {
    return "";
  }

  const date = new Date();

  return `${wikidataId}\tP856\t"${homepage}"\tS854\t"https://registry.npmjs.org/${packageName}"\tS813\t${wikiDataDate(
    date
  )}`;
}

for (const obj of (queryRes as any).results.bindings) {
  console.log(
    await quickstatementNpmPackage(
      obj.npmPackageName.value,
      obj.itemLabel.value
    )
  );
}
