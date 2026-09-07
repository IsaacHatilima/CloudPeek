import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

const THIN_ROUTES = [
  "src/app/index.tsx",
  "src/app/account.tsx",
  "src/app/connect.tsx",
  "src/app/scope.tsx",
  "src/app/resources/[resource]/index.tsx",
  "src/app/resources/[resource]/[id].tsx",
  "src/app/action.tsx",
];

describe("route contract", () => {
  it("ships one route per surface the shell navigates to", () => {
    for (const route of ["src/app/_layout.tsx", ...THIN_ROUTES]) {
      expect(existsSync(join(process.cwd(), route))).toBe(true);
    }
  });

  it("presents the scope picker as a form sheet, the account as a modal, and disables swipe-back on shell screens", () => {
    const layout = source("src/app/_layout.tsx");

    expect(layout).toContain('name="index"');
    expect(layout).not.toContain("(tabs)");
    expect(layout).toContain('name="scope"');
    expect(layout).not.toContain("switch/");
    expect(layout).toContain('presentation: "formSheet"');
    expect(layout).toContain('name="account"');
    expect(layout).toContain('name="connect"');
    expect(layout).toContain('name="action"');
    expect(layout).toContain('name="resources/[resource]/index"');
    expect(layout).toContain('name="resources/[resource]/[id]"');
    expect(layout).toContain('presentation: "modal"');
    expect(layout).toContain("gestureEnabled: false");
    expect(layout).toContain("<ShellLayout>");
  });


  it("keeps route files thin re-exports of feature screens", () => {
    for (const route of THIN_ROUTES) {
      const lines = source(route).trim().split("\n");
      expect(lines.length).toBeLessThanOrEqual(6);
      expect(source(route)).toMatch(/export default/);
    }
  });
});
