import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (request.method !== "GET") {
    // CSRF protection
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
  }
  return NextResponse.next();
}

/** skip static assets, images, and metadata (see Next.js proxy `matcher` docs). */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
