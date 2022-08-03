import got from "got";
import { queryWikidata } from "./wikidata-query.js";

const queryRes = await queryWikidata(`
SELECT DISTINCT ?item ?itemLabel ?npmPackageName WHERE {
  ?item wdt:P8262 ?npmPackageName.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
}
`);

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

  return `${wikidataId}\tP856\t"${homepage}"\tS654\t"https://registry.npmjs.org/${packageName}"\tS813\t+${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T00:00:00Z/11`;
}

for (const obj of (queryRes as any).results.bindings) {
  console.log(
    await quickstatementNpmPackage(
      obj.npmPackageName.value,
      obj.itemLabel.value
    )
  );
}
