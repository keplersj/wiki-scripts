import wiki, { Page } from "wikijs";
import wikidata from "wikidata-sdk";
import got from "got";
import dotenv from "dotenv";
import wikibaseEditor from "wikidata-edit";

const envResult = dotenv.config();

if (envResult.error) {
  console.error(envResult);
  process.exit(1);
}

const wbEdit = wikibaseEditor({
  username: process.env.WIKIBASE_USERNAME,
  password: process.env.WIKIBASE_PASSWORD,
  bot: true,
});

(async function () {
  const ftbCategory: string[] = await (wiki({
    apiUrl: "https://ftb.gamepedia.com/api.php",
  }) as any).pagesInCategory("Category:Mods");

  const url = wikidata.sparqlQuery(`
    SELECT ?item ?itemLabel ?gamepedia
    WHERE
    {
      ?item wdt:P31 wd:Q22906953 .
      ?item wdt:P6623 ?gamepedia
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
      FILTER(STRSTARTS(?gamepedia, "ftb")).
    }
  `);
  const { body: queryResult } = await got.get(url, { responseType: "json" });
  const existingMods: any[] = (queryResult as any).results.bindings;
  const existingModNames: string[] = existingMods.map(
    (item: any) => item.itemLabel.value
  );

  ftbCategory
    .filter((value) => !existingModNames.includes(value))
    .filter((value) => !value.startsWith("Category:"))
    .filter((value) => !value.startsWith("User:"))
    .map((modTitle) => ({
      type: "item",
      labels: {
        en: modTitle,
      },
      claims: {
        // instance of Minecraft mod
        P31: "Q22906953",
        // Gamepedia article ID
        P6623: `ftb:${modTitle}`,
      },
    }))
    .forEach((modEntity) => {
      if (process.env.DRY_RUN) {
        console.log(modEntity);
      } else {
        console.log(`ADDING ${modEntity.labels.en} to WIKIDATA!`);
        wbEdit.entity.create(modEntity);
      }
    });
})();
