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

    expect(result).toMatchInlineSnapshot(`
      Object {
        "dataAttr1": "val11111",
      }
    `);
    expect(mockedGot.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "https://query.wikidata.org/sparql?query=%0A%20%20%20%20SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FnpmPackageName%20WHERE%20%7B%0A%20%20%20%20%20%20%3Fitem%20wdt%3AP8262%20%3FnpmPackageName.%0A%20%20%20%20%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%22.%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20%0A%20%20%20%20LIMIT%2010%0A%20%20%20%20",
          Object {
            "headers": Object {
              "Accept": "application/sparql-results+json",
            },
          },
        ],
      ]
    `);
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
