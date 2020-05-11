import wiki, { Page } from "wikijs";
import wikidata from "wikidata-sdk";
import got from "got";
import dotenv from "dotenv";
import wikibaseEditor from "wikibase-edit";

const envResult = dotenv.config();

if (envResult.error) {
  console.error(envResult);
  process.exit(1);
}

const wbEdit = wikibaseEditor({
  instance: "https://www.wikidata.org",
  credentials: {
    username: process.env.WIKIBASE_USERNAME,
    password: process.env.WIKIBASE_PASSWORD,
  },
  summary: "Import Minecraft mods from Feed the Beast wiki",
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

  const entities = ftbCategory
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
    }));

  for (const entity of entities) {
    if (process.env.DRY_RUN) {
      console.log(entity);
    } else {
      console.log(`ADDING ${entity.labels.en} to WIKIDATA!`);
      await wbEdit.entity.create(entity);
    }
  }
})();
