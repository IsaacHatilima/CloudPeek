import { brand } from "@/theme/brand";
import { PALETTES } from "@/theme/palettes";

const HEX = /^#[0-9A-F]{6}$/;

describe("brand tokens", () => {
  it("pins Laravel red to the specified value", () => {
    expect(brand.laravelRed).toBe("#FF2D20");
  });

  it("pins Cloud blue to Laravel's public --cloud-*-9 token", () => {
    expect(brand.cloudBlue).toBe("#006AFF");
  });

  it("stores every token as an uppercase 6-digit hex", () => {
    for (const value of Object.values(brand)) {
      expect(value).toMatch(HEX);
    }
  });
});

describe("palettes", () => {
  it("expose the same keys in light and dark", () => {
    expect(Object.keys(PALETTES.dark).sort()).toEqual(
      Object.keys(PALETTES.light).sort(),
    );
  });

  it("use the named brand tokens rather than loose hex values", () => {
    expect(PALETTES.light.primary).toBe(brand.laravelRed);
    expect(PALETTES.dark.primary).toBe(brand.laravelRed);
    expect(PALETTES.light.accent).toBe(brand.cloudBlue);
    expect(PALETTES.dark.accent).toBe(brand.cloudBlue);
    expect(PALETTES.light.accentPressed).toBe(brand.cloudBluePressed);
    expect(PALETTES.dark.link).toBe(brand.cloudBlueOnDark);
  });
});
