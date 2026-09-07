import {
  fieldLabel,
  formFields,
  initialValues,
  isEmpty,
  setValue,
} from "@/features/actions/form-model";
import { buildRequest } from "@/features/actions/form-request";
import { compilePattern, REQUIRED_MESSAGE, validateForm } from "@/features/actions/form-validation";
import type { WriteOperation } from "@/services/cloud-api/operation-types";
import { WRITE_OPERATIONS } from "@/services/cloud-api/write-operations.generated";

const op = (id: string): WriteOperation => {
  const found = WRITE_OPERATIONS.find((candidate) => candidate.operationId === id);
  if (!found) throw new Error(`no operation ${id}`);
  return found;
};

describe("formFields", () => {
  it("asks for unfilled path params first, then body, then query", () => {
    const fields = formFields(op("public.instances.failed-jobs.retry"), { instance: "1" });
    expect(fields.map((field) => [field.name, field.section, field.required])).toEqual([
      ["jobId", "param", true],
    ]);

    const many = formFields(op("public.instances.failed-jobs.destroy-many"), { instance: "1" });
    expect(many.map((field) => field.section)).toEqual(["query", "query"]);
  });

  it("labels dotted and camel-cased names for people", () => {
    expect(fieldLabel({ name: "config.queue" })).toBe("Config · Queue");
    expect(fieldLabel({ name: "jobId" })).toBe("Job id");
    expect(fieldLabel({ name: "is_public" })).toBe("Is public");
  });
});

describe("initialValues", () => {
  it("prefills an update from the item's attributes by path", () => {
    const fields = formFields(op("public.applications.update"), { application: "1" });
    const values = initialValues(fields, { name: "landeni-website", slack_channel: null });
    expect(values.name).toBe("landeni-website");
    expect(values.slack_channel).toBe("");
    expect(values.repository).toBe("");
  });

  it("starts required booleans as false on a create and leaves optional ones untouched", () => {
    const values = initialValues(formFields(op("public.caches.store"), {}));
    expect(values.auto_upgrade_enabled).toBe(false);
    expect(values.uses_hibernation).toBeNull();
    expect(values.size).toBe("");
  });

  it("renders lists one per line and objects as JSON", () => {
    const fields = formFields(op("public.buckets.update"), { filesystem: "1" });
    const values = initialValues(fields, {
      cors_settings: { allowed_methods: ["GET", "PUT"], max_age_seconds: 60 },
    });
    expect(values["cors_settings.allowed_methods"]).toBe("GET\nPUT");
    expect(values["cors_settings.max_age_seconds"]).toBe("60");

    const env = formFields(op("public.environments.update"), { environment: "1" });
    const prefilled = initialValues(env, { filesystem_keys: [{ disk: "s3", id: "k" }] });
    expect(prefilled.filesystem_keys).toBe(JSON.stringify([{ disk: "s3", id: "k" }], null, 2));
  });

  it("updates immutably", () => {
    const before = initialValues(formFields(op("public.caches.store"), {}));
    const after = setValue(before, "name", "cache-1");
    expect(after.name).toBe("cache-1");
    expect(before.name).toBe("");
    expect(isEmpty("  ")).toBe(true);
    expect(isEmpty(false)).toBe(false);
  });
});

describe("validateForm", () => {
  const create = formFields(op("public.applications.store"), {});

  it("requires the required fields", () => {
    const errors = validateForm(create, initialValues(create));
    expect(errors).toEqual({ name: REQUIRED_MESSAGE, region: REQUIRED_MESSAGE, repository: REQUIRED_MESSAGE });
  });

  it("checks lengths, patterns, and options", () => {
    const values = { ...initialValues(create), name: "ab", region: "mars", repository: "org/repo" };
    expect(validateForm(create, values)).toEqual({
      name: "At least 3 characters",
      region: '"mars" is not one of the options',
    });
    expect(validateForm(create, { ...values, name: "my app", region: "us-east-1" })).toEqual({});
    expect(validateForm(create, { ...values, name: "bad|name", region: "us-east-1" })).toEqual({
      name: "Does not match the required format",
    });
    expect(validateForm(create, { ...values, name: "Élan Vital", region: "us-east-1" })).toEqual({});
  });

  it("qualifies PCRE script names and skips patterns it cannot compile", () => {
    expect(compilePattern("^[\\p{Latin} ]+$")?.test("Élan")).toBe(true);
    expect(compilePattern("^[\\p{Latin} ]+$")?.test("日本")).toBe(false);
    expect(compilePattern("^[a-z]+$")?.test("abc")).toBe(true);
    expect(compilePattern("(")).toBeNull();
    expect(validateForm([{ kind: "string", name: "x", nullable: false, path: ["x"], pattern: "(", required: false, section: "body" }], { x: "anything" })).toEqual({});
  });

  it("checks numbers, ranges, JSON, and list entries", () => {
    const process = formFields(op("public.instances.background-processes.store"), { instance: "1" });
    const base = { ...initialValues(process), type: "worker" };
    expect(validateForm(process, { ...base, processes: "1.5" })).toEqual({ processes: "Enter a whole number" });
    expect(validateForm(process, { ...base, processes: "11" })).toEqual({ processes: "Must be at most 10" });
    expect(validateForm(process, { ...base, processes: "0" })).toEqual({ processes: "Must be at least 1" });
    expect(validateForm(process, { ...base, processes: "2" })).toEqual({});

    const variables = formFields(op("public.environments.variables.store"), { environment: "1" });
    expect(validateForm(variables, { method: "set", variables: "{oops" })).toEqual({ variables: "Enter valid JSON" });

    const bucket = formFields(op("public.buckets.update"), { filesystem: "1" });
    expect(validateForm(bucket, { "cors_settings.allowed_methods": "GET, FETCH" })).toEqual({
      "cors_settings.allowed_methods": '"FETCH" is not one of the options',
    });
  });
});

describe("buildRequest", () => {
  it("coerces text to the types Cloud expects and nests dotted fields", () => {
    const operation = op("public.instances.background-processes.store");
    const fields = formFields(operation, { instance: "1" });
    const initial = initialValues(fields);
    const values = { ...initial, "config.queue": "default, emails", "config.tries": "3", processes: "2", type: "worker" };
    expect(buildRequest(operation, fields, values, initial, "create")).toEqual({
      body: { config: { queue: "default, emails", tries: 3 }, processes: 2, type: "worker" },
      params: {},
      query: {},
    });
  });

  it("sends only what changed on an update, and null for a cleared nullable field", () => {
    const operation = op("public.environments.update");
    const fields = formFields(operation, { environment: "1" });
    const initial = initialValues(fields, { build_command: "npm run build", name: "production", timeout: 30 });
    const values = { ...initial, build_command: "", timeout: "45", uses_octane: true };
    expect(buildRequest(operation, fields, values, initial, "update").body).toEqual({
      build_command: null,
      timeout: 45,
      uses_octane: true,
    });
    expect(buildRequest(operation, fields, initial, initial, "update").body).toEqual({});
  });

  it("always sends a required field on an update", () => {
    const operation = op("public.domains.update");
    const fields = formFields(operation, { domain: "1" });
    const initial = initialValues(fields, { verification_method: "real_time" });
    expect(buildRequest(operation, fields, initial, initial, "update").body).toEqual({
      verification_method: "real_time",
    });
  });

  it("splits lists, parses JSON, and routes params and query inputs", () => {
    const attach = op("public.environments.secrets.store");
    const attachFields = formFields(attach, { environment: "1" });
    const attachValues = { secrets: "a\nb, c" };
    expect(buildRequest(attach, attachFields, attachValues, initialValues(attachFields), "create").body).toEqual({
      secrets: ["a", "b", "c"],
    });

    const variables = op("public.environments.variables.store");
    const variableFields = formFields(variables, { environment: "1" });
    const body = buildRequest(
      variables,
      variableFields,
      { method: "set", variables: '[{"key":"APP_ENV","value":"production"}]' },
      initialValues(variableFields),
      "create",
    ).body;
    expect(body).toEqual({ method: "set", variables: [{ key: "APP_ENV", value: "production" }] });

    const retry = op("public.instances.failed-jobs.retry");
    const retryFields = formFields(retry, { instance: "1" });
    expect(buildRequest(retry, retryFields, { jobId: " 42 " }, initialValues(retryFields), "create")).toEqual({
      body: null,
      params: { jobId: "42" },
      query: {},
    });

    const purge = op("public.instances.failed-jobs.destroy-many");
    const purgeFields = formFields(purge, { instance: "1" });
    expect(buildRequest(purge, purgeFields, { jobIds: "1,2", failedBefore: "" }, initialValues(purgeFields), "create").query).toEqual({
      jobIds: "1,2",
    });
  });

  it("keeps a picked file as it is for multipart bodies", () => {
    const upload = op("public.applications.avatar.store");
    const fields = formFields(upload, { application: "1" });
    const file = { mimeType: "image/png", name: "avatar.png", uri: "file:///avatar.png" };
    expect(buildRequest(upload, fields, { avatar: file }, initialValues(fields), "create").body).toEqual({
      avatar: file,
    });
    expect(validateForm(fields, { avatar: null })).toEqual({ avatar: REQUIRED_MESSAGE });
    expect(validateForm(fields, { avatar: file })).toEqual({});
  });

  it("coerces numeric enums", () => {
    const operation: WriteOperation = {
      body: {
        contentType: "json",
        fields: [{ kind: "enum", name: "cu", nullable: false, numeric: true, options: ["0.25", "1"], path: ["cu"], required: true }],
      },
      method: "POST",
      operationId: "test.numeric",
      params: [],
      path: "/test",
      query: [],
      summary: "Test",
      tag: "Test",
    };
    const fields = formFields(operation, {});
    expect(buildRequest(operation, fields, { cu: "0.25" }, initialValues(fields), "create").body).toEqual({ cu: 0.25 });
  });
});
