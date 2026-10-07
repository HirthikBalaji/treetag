import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: "Invalid coordinate values" }, { status: 400 });
    }

    // Query OpenStreetMap Nominatim reverse geocoder
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "TreeTag-GIS/1.0 (https://treetag.org; contact@treetag.org)",
        "Accept-Language": "en",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({
        displayName: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        address: {},
        source: "OpenStreetMap",
      });
    }

    const data = await res.json();

    return NextResponse.json({
      displayName: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      address: data.address || {},
      osmId: data.osm_id,
      osmType: data.osm_type,
      source: "OpenStreetMap Nominatim (ODbL)",
    });
  } catch (error) {
    console.error("OSM Reverse Geocode error:", error);
    return NextResponse.json({
      displayName: "Location Coordinates",
      address: {},
      source: "OpenStreetMap",
    });
  }
}
