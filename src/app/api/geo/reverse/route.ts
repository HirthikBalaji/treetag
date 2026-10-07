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

    // Query OpenStreetMap Nominatim reverse geocoder with a 3.5s timeout
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    let displayName = `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`;
    let address = {};
    let osmId = null;
    let osmType = null;

    try {
      const res = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "TreeTag-GIS/1.0 (https://treetag.org; contact@treetag.org)",
          "Accept-Language": "en",
        },
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          displayName = data.display_name;
        }
        if (data.address) {
          address = data.address;
        }
        osmId = data.osm_id;
        osmType = data.osm_type;
      }
    } catch {
      // Graceful fallback when Nominatim is rate-limited or offline
    }

    return NextResponse.json({
      displayName,
      address,
      osmId,
      osmType,
      source: "OpenStreetMap Nominatim (ODbL)",
    });
  } catch {
    return NextResponse.json({
      displayName: "Geographic Location",
      address: {},
      source: "OpenStreetMap",
    });
  }
}
