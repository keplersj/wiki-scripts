import { getAllFandomArticleTitles } from "../../fandom.js";
import { fandomArticleId } from "../../wikidata/properties.js";
import { itemsWithProperty } from "../../wikidata/wikidata-query.js";

export function createExec(fandomWiki: string) {
  return async function exec(): Promise<void> {
    const wikidataPrefix = `${fandomWiki}:`;

    console.log("Getting Articles from Wiki");
    const articles = await getAllFandomArticleTitles(fandomWiki);

    console.log("Getting Wiki items from Wikidata");
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

    const wikiPagesOnWikidata = articles.filter((articleTitle) =>
      wikiDataValues.includes(articleTitle)
    );
    const wikiPagesNotOnWikidata = articles.filter(
      (articleTitle) => !wikiDataValues.includes(articleTitle)
    );

    console.log(
      `There are ${articles.length.toLocaleString()} articles on the ${fandomWiki} wiki.`
    );
    console.log(
      `${wikiPagesOnWikidata.length.toLocaleString()} are linked on Wikidata, the remaining ${wikiPagesNotOnWikidata.length.toLocaleString()} are not linked on Wikidata.`
    );
    console.log(
      `${(
        (wikiPagesOnWikidata.length / articles.length) *
        100
      ).toLocaleString()}% linked on Wikidata`
    );
  };
}
