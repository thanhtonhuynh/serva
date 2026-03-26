import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // const url = request.nextUrl;
  // const pathname = url.pathname;

  // const isMaintenanceOn = process.env.MAINTENANCE_MODE === "true";
  // const bypassTokenEnv = process.env.MAINTENANCE_BYPASS_TOKEN || "";
  // const bypassCookie = request.cookies.get("maintenance-bypass")?.value ?? null;
  // const hasBypassToken = !!bypassTokenEnv && bypassCookie === bypassTokenEnv;

  // const isMaintenancePage = pathname.startsWith("/maintenance");
  // const isStaticAsset =
  //   pathname.startsWith("/_next") ||
  //   pathname.startsWith("/favicon.ico") ||
  //   pathname.startsWith("/static");
  // const isApiRoute = pathname.startsWith("/api");

  // // Special route to set the bypass cookie
  // // Need to visit: https://your-domain.com/maintenance-bypass?token=YOUR_TOKEN
  // if (pathname === "/maintenance-bypass") {
  //   const token = url.searchParams.get("token");

  //   if (!bypassTokenEnv || token !== bypassTokenEnv) {
  //     return new NextResponse("Invalid maintenance bypass token", {
  //       status: 403,
  //     });
  //   }

  //   const response = NextResponse.redirect(new URL("/", request.url));
  //   response.cookies.set("maintenance-bypass", bypassTokenEnv, {
  //     path: "/",
  //     httpOnly: true,
  //     sameSite: "lax",
  //     maxAge: 60 * 60 * 24, // 1 day
  //     secure: process.env.NODE_ENV === "production",
  //   });
  //   return response;
  // }

  // // If maintenance mode is on, redirect to maintenance page
  // if (
  //   isMaintenanceOn &&
  //   !hasBypassToken &&
  //   !isMaintenancePage &&
  //   !isStaticAsset &&
  //   !isApiRoute
  // ) {
  //   return NextResponse.rewrite(new URL("/maintenance", request.url));
  // }

  if (request.method === "GET") {
    const response = NextResponse.next();
    const token = request.cookies.get("session")?.value ?? null;
    if (token !== null) {
      // Only extend cookie expiration on GET requests since we can be sure a new session wasn't set when handling the request.
      response.cookies.set("session", token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        secure: process.env.NODE_ENV === "production",
      });
    }
    return response;
  }

  // CRSF protection
  const originHeader = request.headers.get("Origin");
  // NOTE: You may need to use `X-Forwarded-Host` instead
  const hostHeader = request.headers.get("Host");
  if (originHeader === null || hostHeader === null) {
    return new NextResponse(null, {
      status: 403,
    });
  }
  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    return new NextResponse(null, {
      status: 403,
    });
  }
  if (origin.host !== hostHeader) {
    return new NextResponse(null, {
      status: 403,
    });
  }
  return NextResponse.next();
}
