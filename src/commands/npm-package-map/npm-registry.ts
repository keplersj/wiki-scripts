import got from "got";

interface RegistryResult {
  versions: {
    [version: string]: Object;
  };
  bugs?: { url: string };
  homepage?: string;
  time: {
    [version: string]: string;
  };
}

export async function getPackageManifest(
  packageName: string
): Promise<RegistryResult> {
  return await got(`https://registry.npmjs.org/${packageName}`).json();
}
