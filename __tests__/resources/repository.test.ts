import { presentRepository } from "@/features/resources/detail/repository";

it("builds a GitHub link from Cloud's compact payload", () => {
  expect(presentRepository({ full_name: "LandeniApp/landeni-api", default_branch: "main" })).toEqual({ name: "LandeniApp/landeni-api", branch: "main", href: "https://github.com/LandeniApp/landeni-api" });
  expect(presentRepository("org/repo.git")?.href).toBe("https://github.com/org/repo");
});
it("respects explicit providers and canonical repository URLs", () => {
  expect(presentRepository({ full_name: "group/subgroup/repo" }, "gitlab")?.href).toBe("https://gitlab.com/group/subgroup/repo");
  expect(presentRepository({ full_name: "team/repo", provider: "bitbucket" })?.href).toBe("https://bitbucket.org/team/repo");
  expect(presentRepository({ web_url: "https://gitlab.example.org/team/repo.git" }, "gitlab_self_hosted")).toEqual({ name: "team/repo", href: "https://gitlab.example.org/team/repo" });
  expect(presentRepository({ html_url: "https://github.com/org/repo/" })?.href).toBe("https://github.com/org/repo");
  expect(presentRepository({ full_name: "team/repo" }, "unknown")).toEqual({ name: "team/repo" });
  expect(presentRepository("group/sub/repo")?.href).toBeUndefined();
});
it("does not create a link from malformed or unsafe data", () => {
  for (const input of [null, [], {}, 123, "repo", "../repo", "org/../repo", "org/a b"]) expect(presentRepository(input)).toBeNull();
  for (const url of ["javascript:alert(1)", "http://github.com/a/b", "https://user:password@github.com/a/b", "https://github.com/a/b?token=secret", "https://github.com/a/b#token", "https://github.com:8443/a/b", "https://unrelated.example/a/b", "invalid"]) {
    expect(presentRepository({ html_url: url })).toBeNull();
  }
});
