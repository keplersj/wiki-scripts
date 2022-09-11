import { sourceReferenceUrl, sourceRetrieved } from "./properties.js";

export function stringValue(value: string): string {
  return `"${value}"`;
}

export function tabSeparatedList(...items: string[]): string {
  return items.join("\t");
}

export function dateValue(date: Date = new Date()): string {
  return `+${date.toISOString().split(".")[0]}Z/11`;
}

export function sourceRetrievedFromNpm(packageName: string): string {
  return tabSeparatedList(
    sourceReferenceUrl,
    stringValue(`https://registry.npmjs.org/${packageName}`),
    sourceRetrieved,
    dateValue()
  );
}
