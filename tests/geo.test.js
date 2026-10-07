const test = require("node:test");
const assert = require("node:assert");

// Haversine formula calculation test
function calculateDistanceMeters(pointA, pointB) {
  const R = 6371000;
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

function formatCoordinates(lat, lng) {
  const latCard = lat >= 0 ? "N" : "S";
  const lngCard = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(6)}° ${latCard}, ${Math.abs(lng).toFixed(6)}° ${lngCard}`;
}

function treesToGeoJSON(trees) {
  return {
    type: "FeatureCollection",
    features: trees.map((t) => ({
      type: "Feature",
      id: t.treeCode,
      geometry: {
        type: "Point",
        coordinates: [t.longitude, t.latitude],
      },
      properties: {
        treeCode: t.treeCode,
        commonName: t.commonName,
        scientificName: t.scientificName,
        healthStatus: t.healthStatus,
      },
    })),
  };
}

test("Geospatial: Haversine distance between two points", () => {
  // Chennai Point A (13.0827, 80.2707) and nearby Point B (13.0837, 80.2717)
  const pointA = { latitude: 13.0827, longitude: 80.2707 };
  const pointB = { latitude: 13.0837, longitude: 80.2717 };

  const dist = calculateDistanceMeters(pointA, pointB);
  assert.ok(dist > 140 && dist < 170, `Distance should be ~154m, got ${dist}`);
});

test("Geospatial: Format coordinates to cardinal degrees", () => {
  const formatted = formatCoordinates(13.08268, 80.270718);
  assert.strictEqual(formatted, "13.082680° N, 80.270718° E");
});

test("Geospatial: GeoJSON FeatureCollection generation", () => {
  const sampleTrees = [
    {
      treeCode: "TR-000001",
      commonName: "Neem",
      scientificName: "Azadirachta indica",
      healthStatus: "HEALTHY",
      latitude: 13.0827,
      longitude: 80.2707,
    },
    {
      treeCode: "TR-000002",
      commonName: "Banyan",
      scientificName: "Ficus benghalensis",
      healthStatus: "GOOD",
      latitude: 13.085,
      longitude: 80.275,
    },
  ];

  const geoJson = treesToGeoJSON(sampleTrees);
  assert.strictEqual(geoJson.type, "FeatureCollection");
  assert.strictEqual(geoJson.features.length, 2);
  assert.strictEqual(geoJson.features[0].geometry.type, "Point");
  assert.strictEqual(geoJson.features[0].geometry.coordinates[0], 80.2707);
  assert.strictEqual(geoJson.features[0].geometry.coordinates[1], 13.0827);
  assert.strictEqual(geoJson.features[0].properties.commonName, "Neem");
});
