import { initialsFor } from "@/lib/initials";

describe("initialsFor", () => {
  it("takes the first letter of the first two words", () => {
    expect(initialsFor("landeni-website")).toBe("LW");
    expect(initialsFor("my app 2")).toBe("MA");
    expect(initialsFor("über-app")).toBe("ÜA");
  });

  it("uses one letter for a single word and a placeholder for nothing", () => {
    expect(initialsFor("CloudPeek")).toBe("C");
    expect(initialsFor("   ")).toBe("?");
  });
});
