# wiki-scripts

The scripts run by Keplerbot on Wikidata and Wikipedia

## Mapping NPM Packages to WikiData Items

Due to the individually addressable nature of npm packages, and the amount of metadata they carry in their [package manifest](https://docs.npmjs.com/cli/v6/configuring-npm/package-json) (in order to be published to the NPM package registry) it is possible to map published packages and their metadata from NPM to items on Wikidata.

Below is a table containing a rough mapping of package manifest fields to Wikidata properties.

| NPM Manifest Field                                                                                             | Wikidata Property                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`name`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#name)                                      | [npm package (P8262)](https://www.wikidata.org/wiki/Property:P8262)                                                                                                            |
| [`name`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#name)                                      | Item Label (if new item)                                                                                                                                                       |
| [`version`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#version)                                | [software version identifier (P348)](https://www.wikidata.org/wiki/Property:P348)                                                                                              |
| [`description`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#description-1)                      | Item Description (if new item)                                                                                                                                                 |
| [`keywords`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#keywords)                              | _Unknown / Not Applicable_                                                                                                                                                     |
| [`homepage`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#homepage)                              | [official website (P856)](https://www.wikidata.org/wiki/Property:P856)                                                                                                         |
| [`bugs`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#bugs)                                      | Unknown                                                                                                                                                                        |
| [`license`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#license)                                | Unknown                                                                                                                                                                        |
| [`author`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#people-fields-author-contributors)       | Unknown                                                                                                                                                                        |
| [`contributors`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#people-fields-author-contributors) | Unknown                                                                                                                                                                        |
| [`funding`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#funding)                                | Unknown                                                                                                                                                                        |
| [`files`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#files)                                    | Not Applicable                                                                                                                                                                 |
| [`main`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#main)                                      | Not Applicable                                                                                                                                                                 |
| [`browser`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#browser)                                | Unknown / Not Applicable (Could be used to mark if a item is built for the [web](https://www.wikidata.org/wiki/Q6368) [platform](https://www.wikidata.org/wiki/Property:P400)) |
| [`bin`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#bin)                                        | Unknown / Not Applicable                                                                                                                                                       |
| [`man`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#man)                                        | Unknown / Not Applicable                                                                                                                                                       |
| [`directories.*`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#directories)                      | Unknown / Not Applicable                                                                                                                                                       |
| [`repository`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#repository)                          | [source code repository (P1324)](https://www.wikidata.org/wiki/Property:P1324)                                                                                                 |
| [`scripts`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#scripts)                                | Not Applicable                                                                                                                                                                 |
| [`config`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#config)                                  | Unknown / Not Applicable                                                                                                                                                       |
| [`dependencies`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#dependencies)                      | [depends on software (P1547)](https://www.wikidata.org/wiki/Property:P1547)                                                                                                    |
| [`devDependencies`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#devdependencies)                | Unknown ([uses (P2283)](https://www.wikidata.org/wiki/Property:P2283) would likely be a good fit)                                                                              |
| [`peerDependencies`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#peerdependencies)              | Unknown                                                                                                                                                                        |
| [`bundledDependencies`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#bundleddependencies)        | Unknown                                                                                                                                                                        |
| [`optionalDependencies`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#optionaldependencies)      | Unknown                                                                                                                                                                        |
| [`engines`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#engines)                                | Unknown ([platform (P400)](https://www.wikidata.org/wiki/Property:P400) would likely be a good fit)                                                                            |
| [`engineStrict`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#enginestrict)                      | Not Applicable                                                                                                                                                                 |
| [`os`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#os)                                          | [operating system (P306)](https://www.wikidata.org/wiki/Property:P306)                                                                                                         |
| [`cup`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#cpu)                                        | Unknown ([platform (P400)](https://www.wikidata.org/wiki/Property:P400) would likely be a good fit)                                                                            |
