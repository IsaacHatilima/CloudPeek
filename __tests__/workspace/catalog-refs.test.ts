import { refsFrom } from "@/features/workspace/catalog-refs";

describe("refsFrom", () => {
  it("maps JSON:API resources to switcher entries", () => {
    expect(
      refsFrom({
        data: [
          { attributes: { name: "Shop", slug: "shop", status: "running" }, id: "app_1", type: "applications" },
          { attributes: {}, id: "app_2", type: "applications" },
        ],
      }),
    ).toEqual([
      { id: "app_1", name: "Shop", slug: "shop", status: "running" },
      { id: "app_2", name: "app_2", slug: undefined, status: undefined },
    ]);
  });

  it("skips entries without an id", () => {
    expect(refsFrom({ data: [{ type: "applications" }, "nope", null] })).toEqual([]);
  });
});

describe("avatar URLs", () => {
  it("keeps a non-empty avatar URL and drops null or empty ones", () => {
    const refs = refsFrom({
      data: [
        { attributes: { avatar_url: "https://cdn/a.png", name: "a" }, id: "1", type: "applications" },
        { attributes: { avatar_url: null, name: "b" }, id: "2", type: "applications" },
        { attributes: { avatar_url: "", name: "c" }, id: "3", type: "applications" },
      ],
    });
    expect(refs.map((ref) => ref.avatarUrl)).toEqual(["https://cdn/a.png", undefined, undefined]);
  });
});
