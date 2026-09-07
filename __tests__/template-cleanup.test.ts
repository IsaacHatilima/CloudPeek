import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Strings that only the original swipe-menu example would contain. If any of
// them reappears in shipped code or metadata, the copy was not fully cleaned.
const TEMPLATE_MARKERS = [
  "code with beto",
  "codewithbeto",
  "cwb",
  "betomoedano",
  "swipe-menu-example",
  "new chat",
  "course lesson",
  "platano",
  "chatgpt",
];

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const root = process.cwd();
const files = [
  ...walk(join(root, "src")),
  ...walk(join(root, "modules")),
  join(root, "app.json"),
  join(root, "package.json"),
  join(root, "README.md"),
];

describe("template cleanup", () => {
  it.each(files.map((file) => [file.replace(`${root}/`, "")]))(
    "%s contains no identifier from the original example",
    (file) => {
      const contents = readFileSync(join(root, file), "utf8").toLowerCase();

      for (const marker of TEMPLATE_MARKERS) {
        expect(contents).not.toContain(marker);
      }
    },
  );
});
