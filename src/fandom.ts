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
  limit: number = 100
): Promise<FandomResponse> {
  return got
    .get(
      `https://${wiki}.fandom.com/api/v1/Articles/List?${stringify({
        limit,
        offset,
      })}`
    )
    .json();
}

export async function getAllFandomArticleTitles(
  wiki: string
): Promise<string[]> {
  const titles: string[] = [];
  let requestOffset: any = "";

  while (requestOffset !== undefined) {
    const { items, offset } = await getFandomArticles(
      wiki,
      requestOffset,
      1000
    );
    const itemTitles = items.map((item) => item.title);
    titles.push(...itemTitles);
    requestOffset = offset;
  }

  return titles;
}
