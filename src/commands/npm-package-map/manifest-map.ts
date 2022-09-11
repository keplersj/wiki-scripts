import {
  bugTrackerSystem,
  officialWebsite,
  publicationDate,
  softwareVersionIdentifier,
} from "../../wikidata/properties.js";
import {
  sourceRetrievedFromNpm,
  stringValue,
  tabSeparatedList,
  dateValue,
} from "../../wikidata/quickstatements.js";
import { getPackageManifest } from "./npm-registry.js";

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
      softwareVersionIdentifier,
      stringValue(version),
      publicationDate,
      dateValue(new Date(manifest.time[version])),
      sourceRetrievedFromNpm(packageName)
    )
  );

  statements.push(...versions);

  const homepage = manifest.homepage;

  if (homepage) {
    const homepageStatement = statement(
      officialWebsite,
      stringValue(homepage),
      sourceRetrievedFromNpm(packageName)
    );

    statements.push(homepageStatement);
  }

  const bugtracker = manifest.bugs;

  if (bugtracker && bugtracker.url) {
    const bugtrackerStatement = statement(
      bugTrackerSystem,
      stringValue(bugtracker.url),
      sourceRetrievedFromNpm(packageName)
    );

    statements.push(bugtrackerStatement);
  }

  return statements.join("\n");
}
