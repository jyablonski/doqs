import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Database User Permissions Guide", () => {
  const guidePath = join(
    process.cwd(),
    "src/content/docs/guides/database_user_permissions.md"
  );
  const content: string = readFileSync(guidePath, "utf-8");

  it("should have required frontmatter fields", () => {
    expect(content).toContain("title: Database User Permissions");
    expect(content).toContain("description:");
    expect(content).toContain("lastUpdated:");
  });

  it("should have proper main sections", () => {
    expect(content).toContain("## Setup");
    expect(content).toContain("## Permissions Model");
    expect(content).toContain("### Terraform Example");
    expect(content).toContain("### Future Grants");
  });

  it("should document all three permission levels", () => {
    expect(content).toContain("Read Only");
    expect(content).toContain("Read + Write");
    expect(content).toContain("Admin");
  });

  it("should include link to Postgres modules", () => {
    expect(content).toContain(
      "https://github.com/jyablonski/aws_terraform/tree/master/modules/postgresql"
    );
  });

  it("should have terraform code examples", () => {
    expect(content).toContain("```hcl");
    expect(content).toContain("module");
    expect(content).toContain("source");
  });

  it("should mention key roles", () => {
    expect(content).toContain("dbt");
    expect(content).toContain("Ingestion Script");
    expect(content).toContain("REST API");
  });

  it("should explain default privileges", () => {
    expect(content).toContain("Default Privileges");
    expect(content).toContain("future objects");
  });

  it("should have practical examples section", () => {
    expect(content).toContain("### Examples");
    expect(content.toLowerCase()).toContain("dbt:");
    expect(content.toLowerCase()).toContain("ingestion script:");
    expect(content.toLowerCase()).toContain("rest api:");
  });
});
