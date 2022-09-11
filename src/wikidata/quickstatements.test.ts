import { sourceRetrievedFromNpm } from "./quickstatements.js";
import fc from "fast-check";

describe("#sourceRetrievedFromNpm", () => {
  it("given a package name, returns the expected string", () => {
    jest.useFakeTimers().setSystemTime(new Date("2022-01-01"));

    const source = sourceRetrievedFromNpm("test");

    expect(source).toMatchInlineSnapshot(
      `"S854	\\"https://registry.npmjs.org/test\\"	S813	+2022-01-01T00:00:00Z/11"`
    );
  });

  it("contains the package name", () => {
    fc.assert(
      fc.property(fc.string(), (a) => {
        const source = sourceRetrievedFromNpm(a);
        expect(source).toContain(a);
      })
    );
  });
});
