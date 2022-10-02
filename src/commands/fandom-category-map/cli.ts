import { getAllFandomArticles } from "../../fandom.js";
import { fandomArticleId } from "../../wikidata/properties.js";
import { itemsWithProperty } from "../../wikidata/wikidata-query.js";

export function createExec(fandomWiki: string, wikiCategory: string) {
  return async function exec(): Promise<void> {
    const wikidataPrefix = `${fandomWiki}:`;

    // console.log("Getting Articles from Wiki");
    const articles = await getAllFandomArticles(fandomWiki, {
      category: wikiCategory,
    });

    // console.log("Getting Wiki items from Wikidata");
    const {
      results: { bindings: wikiDataItems },
    } = await itemsWithProperty(fandomArticleId, {
      valueStartsWith: wikidataPrefix,
    });
    const wikiDataValues = [
      ...new Set(
        wikiDataItems
          .map((item) => item.propertyValue.value)
          .map((value) => value.replace(wikidataPrefix, ""))
          .sort()
      ),
    ];

    const wikiPagesNotOnWikidata = articles.filter(
      (article) => !wikiDataValues.includes(article.title)
    );

    console.log(`# THIS FILE WAS AUTO-GENERATED ON ${new Date()}
# PLEASE MODIFY TO ADD RELEVANT INFORMATION BEFORE UPLOADING
    `);

    for (const page of wikiPagesNotOnWikidata) {
      console.log(`
CREATE
LAST\tLen\t"${page.title}"
LAST\t${fandomArticleId}\t"${fandomWiki}:${page.url.replace("/wiki/", "")}"`);
    }
  };
}
