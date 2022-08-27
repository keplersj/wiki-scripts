export function tabSeparatedList(...items: string[]): string {
  return items.join("\t");
}

export function wikiDataDate(date: Date = new Date()): string {
  return `+${date.toISOString().split(".")[0]}Z/11`;
}

export function sourceRetrievedFromNpm(packageName: string): string {
  return tabSeparatedList(
    "S854",
    `"https://registry.npmjs.org/${packageName}"`,
    "S813",
    wikiDataDate()
  );
}
