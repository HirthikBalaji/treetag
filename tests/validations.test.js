const test = require("node:test");
const assert = require("node:assert");
const { z } = require("zod");

const treeSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  commonName: z.string().min(1, "Common name is required"),
  scientificName: z.string().min(1, "Scientific name is required"),
  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  healthStatus: z.enum(["HEALTHY", "GOOD", "MODERATE", "POOR", "CRITICAL"]).default("HEALTHY"),
  riskLevel: z.enum(["LOW", "MODERATE", "HIGH", "EXTREME"]).default("LOW"),
});

test("Validation: Accepts valid tree record data", () => {
  const validTree = {
    projectId: "proj_123",
    commonName: "Neem",
    scientificName: "Azadirachta indica",
    latitude: 13.08268,
    longitude: 80.270718,
    healthStatus: "HEALTHY",
    riskLevel: "LOW",
  };

  const result = treeSchema.safeParse(validTree);
  assert.strictEqual(result.success, true);
});

test("Validation: Rejects invalid latitude (> 90 deg)", () => {
  const invalidTree = {
    projectId: "proj_123",
    commonName: "Neem",
    scientificName: "Azadirachta indica",
    latitude: 95.0, // Invalid latitude
    longitude: 80.270718,
  };

  const result = treeSchema.safeParse(invalidTree);
  assert.strictEqual(result.success, false);
});

test("Validation: Computes DBH from circumference (DBH = C / pi)", () => {
  const circumference = 94.25;
  const dbh = parseFloat((circumference / Math.PI).toFixed(1));
  assert.strictEqual(dbh, 30.0);
});

test("Validation: Rejects empty common name", () => {
  const badData = {
    projectId: "proj_123",
    commonName: "",
    scientificName: "Azadirachta indica",
    latitude: 13.0,
    longitude: 80.0,
  };

  const result = treeSchema.safeParse(badData);
  assert.strictEqual(result.success, false);
});
