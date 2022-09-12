const mockedGot = jest.fn();
mockedGot.mockReturnValue({
  json: () => Promise.resolve({ dataAttr1: "val11111" }),
} as any);

jest.mock("got", () => mockedGot);

beforeEach(() => {
  mockedGot.mockClear();
});

import { itemsWithProperty, queryWikidata } from "./wikidata-query";

describe("#queryWikidata", () => {
  it("calls the Wikidata query service as expected", async () => {
    const result = await queryWikidata(`
    SELECT DISTINCT ?item ?itemLabel ?npmPackageName WHERE {
      ?item wdt:P8262 ?npmPackageName.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
    }
    
    LIMIT 10
    `);

    expect(result).toMatchSnapshot();
    expect(mockedGot.mock.calls).toMatchSnapshot();
  });
});

describe("#itemsWithProperty", () => {
  it("calls the Wikidata query as expected", async () => {
    const result = await itemsWithProperty("P1234");

    expect(result).toMatchSnapshot();
    expect(mockedGot.mock.calls).toMatchSnapshot();
  });

  it("calls the Wikidata query as expected, with limit specified", async () => {
    const result = await itemsWithProperty("P1234", { limit: 1000 });

    expect(result).toMatchSnapshot();
    expect(mockedGot.mock.calls).toMatchSnapshot();
  });
});
