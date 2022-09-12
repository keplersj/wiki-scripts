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

interface LocalizedString {
  language: string;
  value: string;
}

interface Snak {
  snaktype: string;
  property: string;
  hash: string;
  datavalue: {
    value: string;
    type: string;
  };
  datatype: string;
}

interface GetIDResult {
  success: number;
  entities: {
    [id: string]: {
      pageid: number;
      ns: number;
      title: string;
      lastrevid: string;
      modified: string;
      type: string;
      id: string;
      labels: {
        [lang: string]: LocalizedString;
      };
      descriptions: {
        [lang: string]: LocalizedString;
      };
      aliases: {
        [lang: string]: Array<LocalizedString>;
      };
      claims: {
        [propId: string]: Array<{
          mainsnak: Snak;
          type: string;
          id: string;
          rank: string;
          references: any[];
        }>;
      };
      sitelinks: {
        [site: string]: {
          site: string;
          title: string;
          badges: any[];
        };
      };
    };
  };
}

export async function getItem(id: string): Promise<GetIDResult> {
  return got(
    `https://www.wikidata.org/w/api.php?${stringify({
      action: "wbgetentities",
      format: "json",
      ids: id,
    })}`
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
