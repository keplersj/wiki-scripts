import got from "got";

interface RegistryResult {
  versions: any[];
}

export async function getPackageManifest(
  packageName: string
): Promise<RegistryResult> {
  return await got(`https://registry.npmjs.org/${packageName}`).json();
}
