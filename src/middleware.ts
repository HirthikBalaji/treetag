import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getJwtRole(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binaryStr = atob(base64);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
    const jsonStr = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(jsonStr);
    return parsed.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("treetag_session")?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/geo/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads/");

  // Unauthenticated user attempting to access protected route
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user checks
  if (token) {
    const role = getJwtRole(token);

    if (role === "SURVEYOR") {
      // Surveyor has access ONLY to the 7-step wizard and strictly required APIs & static assets
      const isAllowedForSurveyor =
        pathname === "/trees/new" ||
        pathname.startsWith("/api/auth/") ||
        pathname.startsWith("/api/geo/") ||
        pathname === "/api/projects" ||
        pathname === "/api/species" ||
        pathname === "/api/trees" ||
        pathname === "/api/upload" ||
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.startsWith("/uploads/");

      if (!isAllowedForSurveyor) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Access denied. Surveyor role is restricted exclusively to tree registration." },
            { status: 403 }
          );
        }
        // Redirect any surveyor page attempt to the 7-step tree registration wizard
        return NextResponse.redirect(new URL("/trees/new", request.url));
      }

      return NextResponse.next();
    }

    // Authenticated non-surveyor user attempting to access login/register
    if (pathname === "/login" || pathname === "/register") {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
