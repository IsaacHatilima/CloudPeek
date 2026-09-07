jest.mock("expo-file-system", () => {
  const files = new Map<string, string>();

  class File {
    readonly uri: string;

    constructor(directory: string, name: string) {
      this.uri = `${directory}/${name}`;
    }

    get exists() {
      return files.has(this.uri);
    }

    create() {
      files.set(this.uri, "");
    }

    delete() {
      files.delete(this.uri);
    }

    textSync() {
      return files.get(this.uri) ?? "";
    }

    write(value: string) {
      files.set(this.uri, value);
    }
  }

  return { File, Paths: { document: "file:///documents" }, __files: files };
});

import { fileStorage } from "@/lib/file-storage";

const { File, __files: files } = jest.requireMock("expo-file-system") as {
  File: { prototype: Record<string, unknown> };
  __files: Map<string, string>;
};

describe("fileStorage", () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    files.clear();
    warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
    jest.restoreAllMocks();
  });

  it("returns null for a store that has never been written", () => {
    expect(fileStorage.getItem("cloudpeek-workspace")).toBeNull();
  });

  it("writes one JSON file per store under the document directory", () => {
    fileStorage.setItem("cloudpeek-workspace", '{"a":1}');

    expect(files.get("file:///documents/cloudpeek-workspace.json")).toBe(
      '{"a":1}',
    );
    expect(fileStorage.getItem("cloudpeek-workspace")).toBe('{"a":1}');
  });

  it("removes the file and reads null afterwards", () => {
    fileStorage.setItem("cloudpeek-workspace", "x");
    fileStorage.removeItem("cloudpeek-workspace");

    expect(fileStorage.getItem("cloudpeek-workspace")).toBeNull();
  });

  it("reports a failed read and falls back to null instead of throwing", () => {
    fileStorage.setItem("cloudpeek-workspace", "x");
    jest.spyOn(File.prototype, "textSync" as never).mockImplementation(() => {
      throw new Error("disk unavailable");
    });

    expect(fileStorage.getItem("cloudpeek-workspace")).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('file read of "cloudpeek-workspace" failed'),
    );
  });

  it("reports a failed write without throwing", () => {
    jest.spyOn(File.prototype, "write" as never).mockImplementation(() => {
      throw new Error("read-only");
    });

    expect(() => fileStorage.setItem("cloudpeek-workspace", "x")).not.toThrow();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("write"));
  });
});
