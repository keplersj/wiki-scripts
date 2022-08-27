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

export async function queryWikidata<T>(query: string): Promise<QueryResult<T>> {
  return got(
    `https://query.wikidata.org/sparql?${stringify({
      query,
    })}`,
    { headers: { Accept: "application/sparql-results+json" } }
  ).json();
}
