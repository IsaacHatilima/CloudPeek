import {
  claimedOperations,
  isDestructive,
  missingParams,
  needsInput,
  resourceActions,
  WRITE_TARGETS,
} from "@/features/actions/action-catalog";
import { ALL_RESOURCES } from "@/features/cloud-resources/catalog";
import { WRITE_OPERATIONS } from "@/services/cloud-api/write-operations.generated";

const ids = (ops: readonly { operationId: string }[]) => ops.map((op) => op.operationId).sort();

describe("action catalog", () => {
  it("places every generated write operation in exactly one resource", () => {
    const claimed = claimedOperations().map((op) => op.operationId);
    expect(new Set(claimed).size).toBe(claimed.length);
    expect([...claimed].sort()).toEqual(ids(WRITE_OPERATIONS));
  });

  it("only targets resources that exist in the side menu", () => {
    const known = new Set(ALL_RESOURCES.map((item) => item.id));
    for (const id of Object.keys(WRITE_TARGETS)) expect(known.has(id as never)).toBe(true);
  });

  it("gives applications create, update, delete and the two avatar commands", () => {
    const actions = resourceActions("applications");
    expect(actions.create?.operationId).toBe("public.applications.store");
    expect(actions.update?.operationId).toBe("public.applications.update");
    expect(actions.remove?.operationId).toBe("public.applications.destroy");
    expect(actions.idParam).toBe("application");
    expect(ids(actions.commands)).toEqual([
      "public.applications.avatar.destroy",
      "public.applications.avatar.store",
    ]);
  });

  it("gives environments their seven commands and none of the child creates", () => {
    const actions = resourceActions("environments");
    expect(actions.create?.path).toBe("/applications/{application}/environments");
    expect(ids(actions.commands)).toEqual([
      "public.environments.purge-edge-cache",
      "public.environments.secrets.store",
      "public.environments.start",
      "public.environments.stop",
      "public.environments.vanity-domain.update",
      "public.environments.variables.destroy",
      "public.environments.variables.store",
    ]);
  });

  it("treats deployments and commands as create-only resources", () => {
    const deployments = resourceActions("deployments");
    expect(deployments.create?.operationId).toBe("public.environments.deployments.store");
    expect(deployments.update).toBeNull();
    expect(deployments.remove).toBeNull();
    expect(deployments.commands).toEqual([]);
    expect(resourceActions("commands").create?.summary).toBe("Run command");
  });

  it("keeps failed-job commands on instances, with the job id as an extra param", () => {
    const actions = resourceActions("instances");
    const retry = actions.commands.find((op) => op.operationId === "public.instances.failed-jobs.retry");
    expect(retry?.params).toEqual(["instance", "jobId"]);
    expect(missingParams(retry!, { instance: "1" })).toEqual(["jobId"]);
    expect(missingParams(retry!, { instance: "1", jobId: "7" })).toEqual([]);
    expect(actions.commands).toHaveLength(7);
  });

  it("scopes a database inside its cluster", () => {
    const actions = resourceActions("databases");
    expect(actions.idParam).toBe("schema");
    expect(actions.remove?.params).toEqual(["database", "schema"]);
    expect(resourceActions("database-clusters").commands).toEqual([]);
    expect(resourceActions("database-restores").create?.operationId).toBe(
      "public.databases.clusters.restore",
    );
  });

  it("has nothing for read-only resources", () => {
    expect(resourceActions("regions")).toEqual({
      commands: [],
      create: null,
      idParam: null,
      remove: null,
      update: null,
    });
  });

  it("flags deletes and purges as destructive", () => {
    const find = (id: string) => WRITE_OPERATIONS.find((op) => op.operationId === id)!;
    expect(isDestructive(find("public.applications.destroy"))).toBe(true);
    expect(isDestructive(find("public.environments.purge-edge-cache"))).toBe(true);
    expect(isDestructive(find("public.environments.variables.destroy"))).toBe(true);
    expect(isDestructive(find("public.environments.start"))).toBe(false);
  });

  it("needs input for bodies, query inputs, or unfilled params only", () => {
    const find = (id: string) => WRITE_OPERATIONS.find((op) => op.operationId === id)!;
    expect(needsInput(find("public.environments.stop"), { environment: "1" })).toBe(false);
    expect(needsInput(find("public.environments.start"), { environment: "1" })).toBe(true);
    expect(needsInput(find("public.environments.deployments.store"), { environment: "1" })).toBe(false);
    expect(needsInput(find("public.instances.failed-jobs.retry"), { instance: "1" })).toBe(true);
    expect(needsInput(find("public.instances.failed-jobs.destroy-many"), { instance: "1" })).toBe(true);
  });
});
