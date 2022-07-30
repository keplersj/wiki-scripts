import wiki, { Page } from "wikijs";
import wikidata from "wikidata-sdk";
import got from "got";
import dotenv from "dotenv";
import wikibaseEditor from "wikibase-edit";
import React, { useState, useEffect } from "react";
import { render, Box, Static } from "ink";
import Link from "ink-link";
import Table from "ink-table";

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

// (async function () {
//   console.log(`${entities.length} mods to add to WikiData`);

//   for (const entity of entities) {
//     if (process.env.DRY_RUN) {
//       console.log(entity);
//     } else {
//       console.log(`ADDING ${entity.labels.en} to WIKIDATA!`);
//       await wbEdit.entity.create(entity);
//     }
//   }
// })();

const ImportProgress = () => {
  const [ftbMods, setFtbMods] = useState<string[]>([]);
  useEffect(() => {
    async function getFtbMods() {
      const ftbCategory: string[] = await (wiki({
        apiUrl: "https://ftb.gamepedia.com/api.php",
      }) as any).pagesInCategory("Category:Mods");

      setFtbMods(
        ftbCategory
          .filter((value) => !value.startsWith("Category:"))
          .filter((value) => !value.startsWith("User:"))
      );
    }

    getFtbMods();
  }, []);

  const [newEntities, setNewEntities] = useState<object[]>([]);
  useEffect(() => {
    async function createNewEntities() {
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
      const { body: queryResult } = await got.get(url, {
        responseType: "json",
      });
      const existingMods: any[] = (queryResult as any).results.bindings;
      const existingModNames: string[] = existingMods.map(
        (item: any) => item.itemLabel.value
      );

      const entities = ftbMods
        .filter((value) => !existingModNames.includes(value))
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

      setNewEntities(entities);
    }

    createNewEntities();
  }, [ftbMods]);

  return (
    <Box justifyContent="space-around">
      <Box width="50%">
        {ftbMods.map((mod, index) => (
          <Link
            key={`${index}::${mod}`}
            url={`https://ftb.gamepedia.com/${encodeURIComponent(mod)}`}
          >
            {mod}
          </Link>
        ))}
      </Box>
      <Box width="50%">
        <Table data={newEntities} />
      </Box>
    </Box>
  );
};

render(<ImportProgress />);
