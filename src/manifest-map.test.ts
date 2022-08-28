jest.useFakeTimers().setSystemTime(new Date("2022-01-01"));

const mockManifest = {
  versions: {
    "1.0.0": {},
  },
  time: {
    "1.0.0": new Date().toISOString(),
  },
};

const mockedGot = jest.fn();
mockedGot.mockReturnValue({
  json: () => Promise.resolve(mockManifest),
} as any);

jest.mock("got", () => mockedGot);

import { quickstatementNpmPackage } from "./manifest-map";

describe("#quickstatementNpmPackage", () => {
  it("maps an npm package to QuickStatements", async () => {
    const result = await quickstatementNpmPackage("test-package", "W111111");

    expect(result).toMatchInlineSnapshot(
      `"W111111	P348	\\"1.0.0\\"	P577	+2022-01-01T00:00:00Z/11	S854	\\"https://registry.npmjs.org/test-package\\"	S813	+2022-01-01T00:00:00Z/11"`
    );
    expect(mockedGot.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "https://registry.npmjs.org/test-package",
        ],
      ]
    `);
  });
});
