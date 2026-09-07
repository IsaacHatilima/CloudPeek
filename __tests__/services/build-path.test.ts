import type { CloudEndpoint } from "@/features/cloud-resources/types";
import {
  buildPath,
  buildUrl,
  MissingPathParamError,
} from "@/services/cloud-api/build-path";

const deployments: CloudEndpoint = {
  kind: "collection",
  method: "GET",
  operationId: "public.environments.deployments.index",
  params: ["environment"],
  path: "/environments/{environment}/deployments",
};

const applications: CloudEndpoint = {
  kind: "collection",
  method: "GET",
  operationId: "public.applications.index",
  params: [],
  path: "/applications",
};

describe("buildPath", () => {
  it("substitutes each placeholder with the URL-encoded value", () => {
    expect(buildPath(deployments, { environment: "env 1/x" })).toBe(
      "/environments/env%201%2Fx/deployments",
    );
  });

  it("leaves a parameterless path untouched", () => {
    expect(buildPath(applications, {})).toBe("/applications");
  });

  it("refuses to send a path with an empty segment", () => {
    expect(() => buildPath(deployments, {})).toThrow(MissingPathParamError);
    expect(() => buildPath(deployments, { environment: "" })).toThrow(
      MissingPathParamError,
    );
    expect(() => buildPath(deployments, {})).toThrow(
      /"environment".*public\.environments\.deployments\.index/,
    );
  });
});

describe("buildUrl", () => {
  it("prefixes the Cloud API base and appends the query string", () => {
    expect(
      buildUrl(
        deployments,
        { environment: "env_1" },
        { "filter[status]": "running", page: undefined },
      ),
    ).toBe(
      "https://cloud.laravel.com/api/environments/env_1/deployments?filter%5Bstatus%5D=running",
    );
  });

  it("omits the question mark when there is no query", () => {
    expect(buildUrl(applications, {})).toBe(
      "https://cloud.laravel.com/api/applications",
    );
    expect(buildUrl(applications, {}, {})).toBe(
      "https://cloud.laravel.com/api/applications",
    );
  });

  it("accepts a different base URL without doubling slashes", () => {
    expect(
      buildUrl(applications, {}, undefined, "https://example.test/api/"),
    ).toBe("https://example.test/api/applications");
  });
});

describe("buildPath with a repeated placeholder", () => {
  it("substitutes every occurrence, not just the first", () => {
    const twice: CloudEndpoint = {
      kind: "collection",
      method: "GET",
      operationId: "test.repeated",
      params: ["id"],
      path: "/a/{id}/b/{id}",
    };

    expect(buildPath(twice, { id: "x" })).toBe("/a/x/b/x");
  });
});
