import { z } from "zod";

export const treeSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  commonName: z.string().min(1, "Common name is required"),
  scientificName: z.string().min(1, "Scientific name is required"),
  family: z.string().optional().nullable(),
  genus: z.string().optional().nullable(),
  species: z.string().optional().nullable(),
  variety: z.string().optional().nullable(),
  nativeStatus: z.boolean().default(true),
  identificationConfidence: z.number().min(1).max(100).default(100),

  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  gpsAccuracy: z.number().optional().nullable(),
  altitude: z.number().optional().nullable(),
  locationSource: z.enum(["DEVICE_GPS", "MANUAL_PIN", "MAP_ADJUSTED", "GEOCODER"]).default("DEVICE_GPS"),

  height: z.number().positive().optional().nullable(),
  trunkCircumference: z.number().positive().optional().nullable(),
  dbh: z.number().positive().optional().nullable(),
  canopyWidth: z.number().positive().optional().nullable(),
  estimatedAge: z.number().int().positive().optional().nullable(),

  healthStatus: z.enum(["HEALTHY", "GOOD", "MODERATE", "POOR", "CRITICAL"]).default("HEALTHY"),
  riskLevel: z.enum(["LOW", "MODERATE", "HIGH", "EXTREME"]).default("LOW"),

  trunkCondition: z.string().optional().nullable(),
  leafCondition: z.string().optional().nullable(),
  structuralCondition: z.string().optional().nullable(),
  pestStatus: z.string().optional().nullable(),
  diseaseStatus: z.string().optional().nullable(),
  damageStatus: z.string().optional().nullable(),

  soilCondition: z.string().optional().nullable(),
  sunlight: z.string().optional().nullable(),
  waterAvailability: z.string().optional().nullable(),
  surroundingEnvironment: z.string().optional().nullable(),
  competition: z.string().optional().nullable(),

  irrigationRequired: z.boolean().default(false),
  pruningRequired: z.boolean().default(false),
  fertilizationRequired: z.boolean().default(false),
  pestControlRequired: z.boolean().default(false),
  supportRequired: z.boolean().default(false),

  notes: z.string().optional().nullable(),
  visibility: z.string().default("PUBLIC"),

  photos: z.array(z.object({
    fileUrl: z.string().url(),
    photoType: z.enum(["FULL_TREE", "TRUNK", "LEAVES", "BARK", "FLOWERS", "FRUIT", "DAMAGE", "DISEASE", "ENVIRONMENT"]).default("FULL_TREE"),
    caption: z.string().optional().nullable(),
    isPrimary: z.boolean().default(false),
  })).optional(),
});

export const inspectionSchema = z.object({
  healthStatus: z.enum(["HEALTHY", "GOOD", "MODERATE", "POOR", "CRITICAL"]),
  riskLevel: z.enum(["LOW", "MODERATE", "HIGH", "EXTREME"]).default("LOW"),
  observations: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
  nextInspectionDate: z.string().optional().nullable(),
  photos: z.array(z.string().url()).optional(),
});

export const maintenanceSchema = z.object({
  maintenanceType: z.enum([
    "WATERING",
    "PRUNING",
    "FERTILIZATION",
    "PEST_CONTROL",
    "DISEASE_TREATMENT",
    "STRUCTURAL_SUPPORT",
    "CLEANING",
    "SOIL_TREATMENT",
    "TRANSPLANTATION",
    "OTHER",
  ]),
  description: z.string().min(1, "Description is required"),
  notes: z.string().optional().nullable(),
  cost: z.number().nonnegative().optional().nullable(),
  performedAt: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  organization: z.string().optional(),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "SURVEYOR", "VIEWER"]).default("SURVEYOR"),
});
