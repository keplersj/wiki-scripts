import meow from "meow";
import { match } from "ts-pattern";
import { exec as npmPackageMap } from "./npm-package-map/cli.js";

const cli = meow(
  `
	Usage
	  $ wiki-scripts <command>

	Commands
	  npm-package-map  Queries Wikidata for NPM Packages, pulls updates into QuickStatements batch

	Examples
	  $ wiki-scripts npm-package-map
`,
  {
    importMeta: import.meta,
  }
);

match<string, void>(cli.input[0])
  .with("npm-package-map", npmPackageMap)
  .otherwise(() => {
    console.log(
      "No valid command provided. Please see wiki-scripts --help for more."
    );
  });
