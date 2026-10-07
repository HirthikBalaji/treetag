/**
 * Geospatial utility functions for TreeTag GIS platform
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/**
 * Calculate Great-Circle distance between two points in meters using Haversine formula
 */
export function calculateDistanceMeters(
  pointA: GeoPoint,
  pointB: GeoPoint
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((pointB.latitude - pointA.latitude) * Math.PI) / 180;
  const dLon = ((pointB.longitude - pointA.longitude) * Math.PI) / 180;
  const lat1 = (pointA.latitude * Math.PI) / 180;
  const lat2 = (pointB.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format coordinates to human-readable DMS or standard decimal format
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latCard = lat >= 0 ? "N" : "S";
  const lngCard = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(6)}° ${latCard}, ${Math.abs(lng).toFixed(6)}° ${lngCard}`;
}

/**
 * Convert an array of Tree records to GeoJSON FeatureCollection
 */
export function treesToGeoJSON(trees: any[]): any {
  return {
    type: "FeatureCollection",
    metadata: {
      generatedAt: new Date().toISOString(),
      platform: "TreeTag Digital Tree Registry",
      count: trees.length,
      crs: {
        type: "name",
        properties: {
          name: "urn:ogc:def:crs:OGC:1.3:CRS84",
        },
      },
    },
    features: trees.map((t) => ({
      type: "Feature",
      id: t.treeCode || t.id,
      geometry: {
        type: "Point",
        coordinates: [t.longitude, t.latitude, t.altitude || 0],
      },
      properties: {
        id: t.id,
        treeCode: t.treeCode,
        openSourceId: t.openSourceId,
        sourceDataset: t.sourceDataset,
        commonName: t.commonName,
        scientificName: t.scientificName,
        family: t.family,
        genus: t.genus,
        species: t.species,
        nativeStatus: t.nativeStatus,
        healthStatus: t.healthStatus,
        riskLevel: t.riskLevel,
        height: t.height,
        dbh: t.dbh,
        trunkCircumference: t.trunkCircumference,
        canopyWidth: t.canopyWidth,
        estimatedAge: t.estimatedAge,
        gpsAccuracy: t.gpsAccuracy,
        locationSource: t.locationSource,
        projectName: t.project?.name,
        createdByName: t.createdBy?.name,
        lastInspectedAt: t.lastInspectedAt,
        nextInspectionAt: t.nextInspectionAt,
        primaryPhotoUrl: t.photos?.find((p: any) => p.isPrimary)?.fileUrl || t.photos?.[0]?.fileUrl,
        notes: t.notes,
        createdAt: t.createdAt,
      },
    })),
  };
}

/**
 * Convert tree records to CSV string
 */
export function treesToCSV(trees: any[]): string {
  const headers = [
    "Tree Code",
    "Open Source ID",
    "Source Dataset",
    "Common Name",
    "Scientific Name",
    "Family",
    "Native",
    "Health Status",
    "Risk Level",
    "Latitude",
    "Longitude",
    "GPS Accuracy (m)",
    "Altitude (m)",
    "Height (m)",
    "DBH (cm)",
    "Circumference (cm)",
    "Canopy Width (m)",
    "Estimated Age (yrs)",
    "Project",
    "Recorded By",
    "Last Inspection",
    "Next Inspection",
    "Created Date",
    "Notes",
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = trees.map((t) => [
    escapeCSV(t.treeCode),
    escapeCSV(t.openSourceId || ""),
    escapeCSV(t.sourceDataset || "TreeTag In-Situ"),
    escapeCSV(t.commonName),
    escapeCSV(t.scientificName),
    escapeCSV(t.family),
    escapeCSV(t.nativeStatus ? "Yes" : "No"),
    escapeCSV(t.healthStatus),
    escapeCSV(t.riskLevel),
    escapeCSV(t.latitude),
    escapeCSV(t.longitude),
    escapeCSV(t.gpsAccuracy),
    escapeCSV(t.altitude),
    escapeCSV(t.height),
    escapeCSV(t.dbh),
    escapeCSV(t.trunkCircumference),
    escapeCSV(t.canopyWidth),
    escapeCSV(t.estimatedAge),
    escapeCSV(t.project?.name || ""),
    escapeCSV(t.createdBy?.name || ""),
    escapeCSV(t.lastInspectedAt ? new Date(t.lastInspectedAt).toISOString().split("T")[0] : ""),
    escapeCSV(t.nextInspectionAt ? new Date(t.nextInspectionAt).toISOString().split("T")[0] : ""),
    escapeCSV(new Date(t.createdAt).toISOString().split("T")[0]),
    escapeCSV(t.notes || ""),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
