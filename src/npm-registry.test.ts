const mockedGot = jest.fn();
mockedGot.mockReturnValue({
  json: () => Promise.resolve({ dataAttr1: "val11111" }),
} as any);

jest.mock("got", () => mockedGot);

import { getPackageManifest } from "./npm-registry";

describe("#getPackageManifest", () => {
  it("calls the npm package registry as expected", async () => {
    const result = await getPackageManifest("test-package");

    expect(result).toMatchInlineSnapshot(`
      Object {
        "dataAttr1": "val11111",
      }
    `);
    expect(mockedGot.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "https://registry.npmjs.org/test-package",
        ],
      ]
    `);
  });
});
