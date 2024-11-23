import { NextResponse, type NextRequest } from "next/server";
import logger from "@/utils/logger";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (csrfBlocker(request) === "block") {
    return new NextResponse(null, {
      status: 403,
    });
  }

  return NextResponse.next();
}

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next
//      * - static (static files)
//      * - favicon.ico (favicon file)
//      */
//     "/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico).*)",
//     "/",
//   ],
// };

function csrfBlocker(request: NextRequest): "block" | "allow" {
  if (request.method === "GET") {
    return "allow";
  }
  const originHeader = request.headers.get("Origin");
  const hostHeader = request.headers.get("Host");

  if (
    !originHeader ||
    !hostHeader ||
    !verifyRequestOrigin(originHeader, [hostHeader])
  ) {
    return "block";
  }

  return "allow";
}

function verifyRequestOrigin(
  originHeader: string,
  allowedOrigins: string[],
): boolean {
  try {
    const originUrl = new URL(originHeader);

    return allowedOrigins.some((allowedOrigin) => {
      const allowedUrl = new URL(`http://${allowedOrigin}`);

      return originUrl.hostname === allowedUrl.hostname;
    });
  } catch {
    logger.error("Error verifying request origin:", originHeader);

    return false;
  }
}
