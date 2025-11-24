import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Backfilling Runbook", () => {
  const runbookPath = join(
    process.cwd(),
    "src/content/docs/runbooks/backfilling.mdx"
  );
  const content: string = readFileSync(runbookPath, "utf-8");

  describe("Frontmatter", () => {
    it("should have required frontmatter fields", () => {
      expect(content).toContain("title: Backfilling");
      expect(content).toContain("description:");
      expect(content).toContain("lastUpdated:");
    });

    it("should have authors field", () => {
      expect(content).toContain("authors:");
      expect(content).toContain("jyablonski");
    });

    it("should have tags", () => {
      expect(content).toContain("tags:");
      expect(content).toContain("test1");
      expect(content).toContain("test2");
    });
  });

  describe("Structure", () => {
    it("should have main sections", () => {
      expect(content).toContain("## Data Sources");
      expect(content).toContain("### Ingestion Script");
      expect(content).toContain("### dbt");
      expect(content).toContain("### ML Pipeline");
      expect(content).toContain("## Rebooting Downstream Services");
    });

    it("should import Astro Image component", () => {
      expect(content).toContain('import { Image } from "astro:assets"');
    });

    it("should import slack alert image", () => {
      expect(content).toContain("import slack_alert from");
      expect(content).toContain("slack_alert.png");
    });
  });

  describe("Ingestion Script Section", () => {
    it("should document backfill command", () => {
      expect(content).toContain("python -m scripts.backfill");
      expect(content).toContain("--run_date");
    });

    it("should have example date format", () => {
      expect(content).toContain("2025-01-01");
      expect(content).toContain("YYYY-MM-DD");
    });

    it("should mention Slack alert", () => {
      expect(content).toContain("Slack");
      expect(content).toContain("alert");
    });

    it("should reference bronze schema", () => {
      expect(content).toContain("bronze");
    });
  });

  describe("dbt Section", () => {
    it("should have dbt build commands", () => {
      expect(content).toContain("dbt build");
      expect(content).toContain("--select");
      expect(content).toContain("--target prod");
    });

    it("should document specific model refresh", () => {
      expect(content).toContain("fact_boxscores+");
      expect(content).toContain("fact_pbp_data+");
      expect(content).toContain("fact_schedule_data+");
    });

    it("should document full refresh option", () => {
      expect(content).toContain("--full-refresh");
    });

    it("should mention full refresh timing", () => {
      expect(content).toContain("4 minutes");
    });
  });

  describe("ML Pipeline Section", () => {
    it("should document ML pipeline command", () => {
      expect(content).toContain("python -m src.app");
    });

    it("should reference ml_tonights_games table", () => {
      expect(content).toContain("ml_models.ml_tonights_games");
    });

    it("should have verification SQL query", () => {
      expect(content).toContain("```sql");
      expect(content).toContain("select *");
      expect(content).toContain("from ml_models.ml_tonights_games");
      expect(content).toContain("order by game_date desc");
    });
  });

  describe("Downstream Services Section", () => {
    it("should mention REST API behavior", () => {
      expect(content).toContain("REST API");
      expect(content).toContain("stateless");
    });

    it("should reference mart layer", () => {
      expect(content).toContain("mart");
    });

    it("should have ECS reboot script", () => {
      expect(content).toContain("```sh");
      expect(content).toContain("#!/bin/bash");
      expect(content).toContain("aws ecs");
    });

    it("should document ECS cluster and service names", () => {
      expect(content).toContain("jacobs-ecs-ec2-cluster");
      expect(content).toContain("nba_elt_dashboard");
    });

    it("should mention expected downtime", () => {
      expect(content).toContain("5-10 second");
      expect(content).toContain("downtime");
    });
  });

  describe("Code Examples", () => {
    it("should have shell script examples", () => {
      const shellBlocks = content.match(/```sh/g);
      expect(shellBlocks).toBeTruthy();
      expect(shellBlocks!.length).toBeGreaterThanOrEqual(2);
    });

    it("should have SQL examples", () => {
      expect(content).toContain("```sql");
    });

    it("should have proper code block syntax", () => {
      // Count opening and closing code blocks
      const openingBlocks = content.match(/```/g);
      expect(openingBlocks).toBeTruthy();
      expect(openingBlocks!.length % 2).toBe(0); // Should be even (open + close)
    });
  });

  describe("Data Entities", () => {
    it("should document all three data entities", () => {
      expect(content).toContain("3 separate entities");
    });

    it("should mention key data types", () => {
      expect(content).toContain("Boxscore");
      expect(content).toContain("Play-by-Play");
      expect(content).toContain("PBP");
    });
  });

  describe("Notes and Warnings", () => {
    it("should have informational notes", () => {
      expect(content).toContain("_Note:");
    });

    it("should explain optional vs required steps", () => {
      expect(content.toLowerCase()).toContain("optional");
    });
  });
});
