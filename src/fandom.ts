import got from "got";
import { stringify } from "query-string";

export interface FandomItem {
  id: number;
  title: string;
  url: string;
  ns: number;
}

export interface FandomResponse {
  items: Array<FandomItem>;
  basepath: string;
  offset?: string;
}

export async function getFandomArticles(
  wiki: string,
  offset: string = "",
  limit: number = 100,
  additionalOptions: object = {}
): Promise<FandomResponse> {
  return got
    .get(
      `https://${wiki}.fandom.com/api/v1/Articles/List?${stringify({
        limit,
        offset,
        ...additionalOptions,
      })}`
    )
    .json();
}

export async function getAllFandomArticles(
  wiki: string,
  additionalOptions: object = {}
): Promise<FandomItem[]> {
  const itemCollector: FandomItem[] = [];
  let requestOffset: any = "";

  while (requestOffset !== undefined) {
    const { items, offset } = await getFandomArticles(
      wiki,
      requestOffset,
      1000,
      additionalOptions
    );
    itemCollector.push(...items);
    requestOffset = offset;
  }

  return itemCollector;
}

export async function getAllFandomArticleTitles(
  wiki: string,
  additionalOptions: object = {}
): Promise<string[]> {
  const items = await getAllFandomArticles(wiki, additionalOptions);
  return items.map((item) => item.title);
}
