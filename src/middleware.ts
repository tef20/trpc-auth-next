import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.method === "GET") {
    return NextResponse.next();
  }

  const originHeader = request.headers.get("Origin");
  const hostHeader = request.headers.get("Host");

  if (
    !originHeader ||
    !hostHeader ||
    !verifyRequestOrigin(originHeader, [hostHeader])
  ) {
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
    console.error("Error verifying request origin:", originHeader);
    // Invalid origin header format
    return false;
  }
}
