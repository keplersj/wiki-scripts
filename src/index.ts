import { quickstatementNpmPackage } from "./manifest-map.js";
import { QueryResult, queryWikidata } from "./wikidata-query.js";

interface QueryVariables {
  item: { value: string };
  itemLabel: { value: string };
  npmPackageName: { value: string };
}

const queryRes: QueryResult<QueryVariables> = await queryWikidata(`
SELECT DISTINCT ?item ?itemLabel ?npmPackageName WHERE {
  ?item wdt:P8262 ?npmPackageName.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
}

LIMIT 10
`);

for (const obj of queryRes.results.bindings) {
  console.log(
    await quickstatementNpmPackage(
      obj.npmPackageName.value,
      obj.itemLabel.value
    )
  );
}
