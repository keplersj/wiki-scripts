import meow from "meow";
import { match } from "ts-pattern";
import { exec as npmPackageMapHandler } from "./npm-package-map/cli.js";

const cli = meow(
  `
	Usage
	  $ wiki-scripts <command>

	Commands
	  npm-package-map  Queries Wikidata for NPM Packages, pulls updates into QuickStatements batch

    Planned (unimplemented) Commands
      npm-package-import  Creates Wikidata items for any package in the NPM registry without a Wikidata item
      apm-package-map  Queries Wikidata for Atom Package Manager packages, pulls updates in QuickStatements batch
      apm-package-import  Creates Wikidata items for any package in the APM registry without a Wikidata item
      crates-package-map  Queries Wikidata for Crates, pulls updates into QuickStatements batch
      crates-package-import  Creates Wikidata items for any package in the Crates registry without a Wikidata item
      rubygems-package-map  Queries Wikidata for RubyGems, pulls updates into QuickStatements batch
      rubygems-package-import  Creates Wikidata items for any package in the RubyGems registry without a Wikidata item
      repology-package-map  Queries Wikidata for Repology packages, pulls updates into a QuickStatements batch
      repology-package-import  Creates Wikidata items for any package in the Repology registry without a Wikidata item


	Examples
	  $ wiki-scripts npm-package-map
`,
  {
    importMeta: import.meta,
  }
);

const todoHandler = () => {
  console.log("Not yet implemented.");
};

match<string, void>(cli.input[0])
  .with("npm-package-map", npmPackageMapHandler)
  .with("npm-package-import", todoHandler)
  .with("apm-package-map", todoHandler)
  .with("apm-package-import", todoHandler)
  .with("crates-package-map", todoHandler)
  .with("crates-package-import", todoHandler)
  .with("rubygems-package-map", todoHandler)
  .with("rubygems-package-import", todoHandler)
  .with("repology-package-map", todoHandler)
  .with("repology-package-import", todoHandler)
  .otherwise(() => {
    console.log(
      "No valid command provided. Please see wiki-scripts --help for more."
    );
  });
