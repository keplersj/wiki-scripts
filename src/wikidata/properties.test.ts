import * as properties from "./properties.js";

describe("Wikidata Properties Aliases", () => {
  it("exports as expected", () => {
    expect(properties).toMatchSnapshot();
  });
});
