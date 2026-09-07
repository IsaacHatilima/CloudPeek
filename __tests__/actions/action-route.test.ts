import { confirmMessage, successMessage, verbOf } from "@/features/actions/action-copy";
import { actionHref, findOperation, parseActionRoute } from "@/features/actions/action-route";

describe("action route", () => {
  it("round-trips through route params", () => {
    const href = actionHref({
      itemId: "app_1",
      mode: "update",
      operationId: "public.applications.update",
      params: { application: "app_1" },
      resourceId: "applications",
    });
    expect(href.pathname).toBe("/action");
    expect(href.params).toEqual({
      itemId: "app_1",
      mode: "update",
      operationId: "public.applications.update",
      params: '{"application":"app_1"}',
      resourceId: "applications",
    });
    expect(parseActionRoute(href.params)).toEqual({
      itemId: "app_1",
      mode: "update",
      operationId: "public.applications.update",
      params: { application: "app_1" },
      parentId: undefined,
      resourceId: "applications",
    });
  });

  it("defaults to create and rejects unknown operations, bad params, and bad modes", () => {
    expect(parseActionRoute({ operationId: "public.applications.store" })).toMatchObject({ mode: "create", params: {} });
    expect(parseActionRoute({ operationId: "nope" })).toBeNull();
    expect(parseActionRoute({ operationId: "public.applications.store", params: "{oops" })).toBeNull();
    expect(parseActionRoute({ operationId: "public.applications.store", params: '{"a":1}' })).toBeNull();
    expect(parseActionRoute({ operationId: "public.applications.store", params: "[]" })).toBeNull();
    expect(parseActionRoute({ mode: "edit", operationId: "public.applications.store" })).toBeNull();
    expect(parseActionRoute({ operationId: ["a", "b"] })).toBeNull();
    expect(findOperation(undefined)).toBeNull();
  });
});

describe("action copy", () => {
  it("takes the verb from the summary and composes the confirmation", () => {
    expect(verbOf("Delete application")).toBe("Delete");
    expect(verbOf("set the default managed queue")).toBe("Set");
    expect(verbOf("   ")).toBe("Confirm");
    const op = findOperation("public.applications.destroy")!;
    expect(confirmMessage(op, "landeni-website")).toBe(
      "Delete an application and all of its environments.\n\nlandeni-website",
    );
    expect(confirmMessage({ ...op, description: undefined })).toBe("");
    expect(successMessage(op)).toBe("Delete application: done.");
  });
});
