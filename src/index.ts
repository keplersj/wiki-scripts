import meow from "meow";
import { match } from "ts-pattern";
import {
  apmPackageImportHandler,
  apmPackageMapHandler,
  cratesPackageImportHandler,
  cratesPackageMapHandler,
  npmPackageImportHandler,
  npmPackageMapHandler,
  repologyPackageImportHandler,
  repologyPackageMapHandler,
  rubygemsPackageImportHandler,
  rubygemsPackageMapHandler,
  wikiaCheckHandler,
} from "./commands/index.js";

const cli = meow(
  `
	Usage
	  $ wiki-scripts <command>

	Commands
	  npm-package-map  Queries Wikidata for NPM Packages, pulls updates into QuickStatements batch
    fandom-check <wiki>  Query Wikidata for pages from a Wikia/Fandom wiki, check for overlap

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

match<string, void>(cli.input[0])
  .with("npm-package-map", npmPackageMapHandler)
  .with("npm-package-import", npmPackageImportHandler)
  .with("apm-package-map", apmPackageMapHandler)
  .with("apm-package-import", apmPackageImportHandler)
  .with("crates-package-map", cratesPackageMapHandler)
  .with("crates-package-import", cratesPackageImportHandler)
  .with("rubygems-package-map", rubygemsPackageMapHandler)
  .with("rubygems-package-import", rubygemsPackageImportHandler)
  .with("repology-package-map", repologyPackageMapHandler)
  .with("repology-package-import", repologyPackageImportHandler)
  .with("fandom-check", wikiaCheckHandler(cli.input[1]))
  .otherwise(() => {
    console.log(
      "No valid command provided. Please see wiki-scripts --help for more."
    );
  });
