import got from "got";
import { stringify } from "query-string";

export async function queryWikidata(query: string) {
  return got(
    `https://query.wikidata.org/sparql?${stringify({
      query,
    })}`,
    { headers: { Accept: "application/sparql-results+json" } }
  ).json();
}
