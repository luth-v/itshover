/**
 * Script to generate registry.json from icons directory
 *
 * This ensures the shadcn registry stays in sync with the icon files.
 * Run with: `npm run registry:generate` or `npm run registry:sync`
 */

import * as fs from "fs";
import * as path from "path";

const ICONS_DIR = path.join(__dirname, "..", "icons");
const REGISTRY_PATH = path.join(__dirname, "..", "registry.json");

// Files to exclude from registry (not actual icons)
const EXCLUDED_FILES = ["index.ts", "types.ts"];

interface RegistryItem {
  name: string;
  type: "registry:ui";
  registryDependencies: string[];
  dependencies: string[];
  devDependencies: string[];
  files: { path: string; type: "registry:ui" }[];
}

interface Registry {
  $schema: string;
  name: string;
  homepage: string;
  items: RegistryItem[];
}

/**
 * Get all icon files from the icons directory
 */
function getIconFiles(): string[] {
  const files = fs.readdirSync(ICONS_DIR);

  return files.filter((file) => {
    // Only include .tsx files
    if (!file.endsWith(".tsx")) return false;
    // Exclude non-icon files
    if (EXCLUDED_FILES.includes(file)) return false;
    return true;
  });
}

/**
 * Convert filename to registry name (remove .tsx extension)
 */
function fileToRegistryName(filename: string): string {
  return filename.replace(".tsx", "");
}

/**
 * Generate a registry item for an icon file
 */
function generateRegistryItem(filename: string): RegistryItem {
  const name = fileToRegistryName(filename);

  return {
    name,
    type: "registry:ui",
    registryDependencies: [],
    dependencies: ["motion"],
    devDependencies: [],
    files: [
      {
        path: `icons/${filename}`,
        type: "registry:ui",
      },
      {
        path: "icons/types.ts",
        type: "registry:ui",
      },
    ],
  };
}

/**
 * Main function to generate registry.json
 */
function generateRegistry(): void {
  console.log("Scanning icons directory...");
  const iconFiles = getIconFiles();
  console.log(`Found ${iconFiles.length} icon files`);

  console.log("Generating registry items...");
  const items = iconFiles.map(generateRegistryItem);

  // Sort items alphabetically by name
  items.sort((a, b) => a.name.localeCompare(b.name));

  const registry: Registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "itshover",
    homepage: "https://itshover.com",
    items,
  };

  console.log("Writing registry.json...");
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");

  console.log("");
  console.log("✔ Registry generated successfully!");
  console.log(`  - Total icons: ${items.length}`);
  console.log("");
  console.log(
    'Next step: Run "npm run registry:build" to generate public/r/*.json files',
  );
  console.log("");
}

// Run the script
generateRegistry();
