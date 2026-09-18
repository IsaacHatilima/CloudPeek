import { databaseFormFields, databaseTypesFrom } from "@/features/actions/database-options";
import { formFields } from "@/features/actions/form-model";
import { validateForm } from "@/features/actions/form-validation";
import { WRITE_OPERATIONS } from "@/services/cloud-api/write-operations.generated";

const createDatabase = WRITE_OPERATIONS.find((op) => op.operationId === "public.databases.clusters.store")!;
describe("database creation from current API options", () => {
  it("keeps required version editable instead of rendering the empty schema placeholder", () => {
    expect(createDatabase.body?.fields.find((field) => field.name === "version")).toMatchObject({ kind: "string", required: true });
  });
  it("offers versions and regions for the selected type and rejects stale values after a type change", () => {
    const types = databaseTypesFrom([{ type: "laravel_mysql", versions: ["8.4"], regions: ["eu-west-1"] }, { type: "retired_mysql_8", versions: [], regions: [] }, null]);
    expect(types).toHaveLength(1);
    const fields = databaseFormFields(formFields(createDatabase, {}), { type: "laravel_mysql" }, types);
    expect(fields.find((field) => field.name === "version")).toMatchObject({ options: ["8.4"], kind: "enum" });
    expect(validateForm(fields, { type: "laravel_mysql", version: "17", region: "us-east-1" })).toMatchObject({ version: expect.any(String), region: expect.any(String) });
  });
});
