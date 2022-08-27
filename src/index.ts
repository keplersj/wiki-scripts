import { getPackageManifest } from "./npm-registry.js";
import {
  sourceRetrievedFromNpm,
  tabSeparatedList,
  wikiDataDate,
} from "./util.js";
import { QueryResult, queryWikidata } from "./wikidata-query.js";

interface QueryVariables {
  item: any;
  itemLabel: any;
  npmPackageName: any;
}

const queryRes: QueryResult<QueryVariables> = await queryWikidata(`
SELECT DISTINCT ?item ?itemLabel ?npmPackageName WHERE {
  ?item wdt:P8262 ?npmPackageName.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
}
`);

async function quickstatementNpmPackage(
  packageName: string,
  wikidataId: string
): Promise<string> {
  const statements: string[] = [];

  const manifest = await getPackageManifest(packageName);

  const versions = Object.keys(manifest.versions).map((version) =>
    tabSeparatedList(
      wikidataId,
      "P348",
      `"${version}"`,
      "P577",
      wikiDataDate(new Date((manifest as any).time[version])),
      sourceRetrievedFromNpm(packageName)
    )
  );

  statements.push(...versions);

  // const homepage = (manifest as any).homepage;

  // if (homepage) {
  //   const homepageStatement = tabSeparatedList(
  //     wikidataId,
  //     "P856",
  //     `"${homepage}"`,
  //     sourceRetrievedFromNpm(packageName)
  //   );

  //   statements.push(homepageStatement);
  // }

  const bugtracker = (manifest as any).bugs;

  if (bugtracker && bugtracker.url) {
    const bugtrackerStatement = tabSeparatedList(
      wikidataId,
      "P1401",
      `"${bugtracker.url}"`,
      sourceRetrievedFromNpm(packageName)
    );

    statements.push(bugtrackerStatement);
  }

  return statements.join("\n");
}

for (const obj of queryRes.results.bindings) {
  console.log(
    await quickstatementNpmPackage(
      obj.npmPackageName.value,
      obj.itemLabel.value
    )
  );
}
