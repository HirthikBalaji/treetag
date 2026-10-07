/**
 * AI Species & Health Assistant Simulation Engine
 * Provides predictive species matching and computer-vision health hints
 * Note: Never overwrites scientific records without explicit user confirmation.
 */

export interface AISpeciesMatch {
  commonName: string;
  scientificName: string;
  family: string;
  confidence: number;
  nativeStatus: boolean;
  notes: string;
}

export interface AIHealthDiagnosis {
  overallHealthAssessment: "HEALTHY" | "GOOD" | "MODERATE" | "POOR" | "CRITICAL";
  riskScore: number; // 0 to 100
  foliageCondition: string;
  detectedAnomalies: string[];
  recommendedAction: string;
}

const COMMON_SPECIES_LIST: AISpeciesMatch[] = [
  {
    commonName: "Neem",
    scientificName: "Azadirachta indica",
    family: "Meliaceae",
    confidence: 94,
    nativeStatus: true,
    notes: "Pinnate serrated leaflets and characteristic furrowed bark detected.",
  },
  {
    commonName: "Banyan",
    scientificName: "Ficus benghalensis",
    family: "Moraceae",
    confidence: 89,
    nativeStatus: true,
    notes: "Aerial prop roots and glossy leathery elliptical leaves identified.",
  },
  {
    commonName: "Peepal / Sacred Fig",
    scientificName: "Ficus religiosa",
    family: "Moraceae",
    confidence: 92,
    nativeStatus: true,
    notes: "Distinctive caudate tip (extended drip tip) and cordate leaf base observed.",
  },
  {
    commonName: "Gulmohar",
    scientificName: "Delonix regia",
    family: "Fabaceae",
    confidence: 88,
    nativeStatus: false,
    notes: "Bipinnate feathery leaves and spreading flat-topped crown morphology.",
  },
  {
    commonName: "Tamarind",
    scientificName: "Tamarindus indica",
    family: "Fabaceae",
    confidence: 85,
    nativeStatus: true,
    notes: "Dense pinnate foliage with small alternate leaflets and rough dark bark.",
  },
  {
    commonName: "Indian Beech / Pungai",
    scientificName: "Millettia pinnata",
    family: "Fabaceae",
    confidence: 82,
    nativeStatus: true,
    notes: "Smooth grey-brown bark with ovate glossy dark green leaflets.",
  },
  {
    commonName: "Arjuna Tree",
    scientificName: "Terminalia arjuna",
    family: "Combretaceae",
    confidence: 79,
    nativeStatus: true,
    notes: "Large buttressed trunk with smooth exfoliating pinkish-grey bark.",
  },
];

export function predictSpeciesFromPhoto(
  _photoUrlOrBase64?: string,
  hintQuery?: string
): AISpeciesMatch[] {
  if (hintQuery && hintQuery.trim().length > 0) {
    const q = hintQuery.toLowerCase();
    const filtered = COMMON_SPECIES_LIST.filter(
      (s) =>
        s.commonName.toLowerCase().includes(q) ||
        s.scientificName.toLowerCase().includes(q)
    );
    if (filtered.length > 0) return filtered;
  }
  // Return top 3 realistic candidates
  return [
    COMMON_SPECIES_LIST[0],
    {
      ...COMMON_SPECIES_LIST[4],
      confidence: 6,
    },
    {
      commonName: "Other / Unclassified Specimen",
      scientificName: "Unconfirmed species",
      family: "Unknown",
      confidence: 2,
      nativeStatus: true,
      notes: "Requires expert botanical review or floral sample verification.",
    },
  ];
}

export function analyzeTreeHealthAI(
  _photoUrlOrBase64?: string,
  currentStatus: string = "HEALTHY"
): AIHealthDiagnosis {
  if (currentStatus === "CRITICAL" || currentStatus === "POOR") {
    return {
      overallHealthAssessment: currentStatus as any,
      riskScore: 82,
      foliageCondition: "Chlorosis, premature thinning, and leaf necrosis observed",
      detectedAnomalies: [
        "Basal fungal mycelium / conk suspected",
        "Over 35% crown dieback in upper canopy",
        "Mechanical wound on primary lower scaffold branch",
      ],
      recommendedAction: "Schedule priority arborist inspection and root health assessment.",
    };
  }

  return {
    overallHealthAssessment: "HEALTHY",
    riskScore: 12,
    foliageCondition: "High chlorophyll density, uniform turgor, full canopy spread",
    detectedAnomalies: [
      "No pest galleries or borers detected",
      "Bark integrity intact across trunk circumference",
      "Stable root flare attachment",
    ],
    recommendedAction: "Maintain standard seasonal monitoring schedule.",
  };
}
