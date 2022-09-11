import { quickstatementNpmPackage } from "./manifest-map.js";
import {
  itemsWithProperty,
  QueryResult,
  queryWikidata,
} from "../../wikidata/wikidata-query.js";
import { npmPackage } from "../../wikidata/properties.js";

export async function exec(): Promise<void> {
  const queryRes = await itemsWithProperty(npmPackage);

  for (const obj of queryRes.results.bindings) {
    console.log(
      await quickstatementNpmPackage(
        obj.propertyValue.value,
        obj.itemLabel.value
      )
    );
  }
}
