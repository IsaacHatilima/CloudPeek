import { WRITE_OPERATIONS } from "@/services/cloud-api/write-operations.generated";

const spec = require("../../contracts/laravel-cloud-openapi.json") as {
  paths: Record<string, Record<string, { tags?: string[] }>>;
};

describe("generated write operations", () => {
  it("covers every non-GET, non-legacy operation in the contract", () => {
    const expected = Object.entries(spec.paths)
      .flatMap(([path, item]) =>
        Object.entries(item).flatMap(([method, op]) =>
          method !== "get" && !(op.tags ?? []).includes("Databases (Legacy)")
            ? [`${method.toUpperCase()} ${path}`]
            : [],
        ),
      )
      .sort();
    expect(WRITE_OPERATIONS.map((op) => `${op.method} ${op.path}`).sort()).toEqual(expected);
    expect(WRITE_OPERATIONS).toHaveLength(60);
  });

  it("lists the path placeholders in order and only uses multipart for the avatar", () => {
    for (const op of WRITE_OPERATIONS) {
      const placeholders = [...op.path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
      expect(op.params).toEqual(placeholders);
      expect(op.summary).not.toBe("");
    }
    const multipart = WRITE_OPERATIONS.filter((op) => op.body?.contentType === "multipart");
    expect(multipart.map((op) => op.operationId)).toEqual(["public.applications.avatar.store"]);
    expect(multipart[0].body?.fields).toMatchObject([
      { format: "binary", kind: "file", name: "avatar", nullable: false, path: ["avatar"], required: true },
    ]);
  });

  it("flattens nested objects one level and keeps enum options", () => {
    const process = WRITE_OPERATIONS.find((op) => op.operationId === "public.instances.background-processes.store");
    const names = process?.body?.fields.map((field) => field.name);
    expect(names).toEqual(expect.arrayContaining(["type", "processes", "config.queue", "config.force"]));
    const region = WRITE_OPERATIONS.find((op) => op.operationId === "public.applications.store")?.body?.fields.find(
      (field) => field.name === "region",
    );
    expect(region?.kind).toBe("enum");
    expect(region?.options).toContain("us-east-1");
  });
});
