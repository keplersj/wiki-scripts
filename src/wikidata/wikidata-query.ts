import got from "got";
import { stringify } from "query-string";

export interface QueryVariables {
  [key: string]: any;
}

export interface QueryResult<T extends QueryVariables> {
  head: {
    vars: keyof T;
  };
  results: {
    bindings: T[];
  };
}

export async function queryWikidata<T extends QueryVariables>(
  query: string
): Promise<QueryResult<T>> {
  return got(
    `https://query.wikidata.org/sparql?${stringify({
      query,
    })}`,
    { headers: { Accept: "application/sparql-results+json" } }
  ).json();
}

interface ItemsWithPropertyOptions {
  limit?: number;
}

const defaultItemsWithPropertyOptions: ItemsWithPropertyOptions = {};

export interface ItemsWithPropertyVariables {
  item: { value: string };
  itemLabel: { value: string };
  propertyValue: { value: string };
}

export async function itemsWithProperty(
  property: string,
  options: Partial<ItemsWithPropertyOptions> = defaultItemsWithPropertyOptions
) {
  const queryString = `
  SELECT DISTINCT ?item ?itemLabel ?propertyValue WHERE {
    ?item wdt:${property} ?propertyValue.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
  }
  
  ${options.limit ? `LIMIT ${options.limit}` : ""}
  `;

  const queryRes: QueryResult<ItemsWithPropertyVariables> = await queryWikidata(
    queryString
  );

  return queryRes;
}
