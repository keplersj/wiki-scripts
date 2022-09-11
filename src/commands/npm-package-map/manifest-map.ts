import { getPackageManifest } from "./npm-registry.js";
import {
  sourceRetrievedFromNpm,
  tabSeparatedList,
  wikiDataDate,
} from "./util.js";

export async function quickstatementNpmPackage(
  packageName: string,
  wikidataId: string
): Promise<string> {
  const statement = (...parts: string[]) =>
    tabSeparatedList(wikidataId, ...parts);

  const statements: string[] = [];

  const manifest = await getPackageManifest(packageName);

  const versions = Object.keys(manifest.versions).map((version) =>
    statement(
      "P348",
      `"${version}"`,
      "P577",
      wikiDataDate(new Date(manifest.time[version])),
      sourceRetrievedFromNpm(packageName)
    )
  );

  statements.push(...versions);

  const homepage = manifest.homepage;

  if (homepage) {
    const homepageStatement = statement(
      "P856",
      `"${homepage}"`,
      sourceRetrievedFromNpm(packageName)
    );

    statements.push(homepageStatement);
  }

  const bugtracker = manifest.bugs;

  if (bugtracker && bugtracker.url) {
    const bugtrackerStatement = statement(
      "P1401",
      `"${bugtracker.url}"`,
      sourceRetrievedFromNpm(packageName)
    );

    statements.push(bugtrackerStatement);
  }

  return statements.join("\n");
}