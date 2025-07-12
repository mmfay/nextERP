import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// 🔐 Must match SECRET_KEY in your Python backend
const SECRET_KEY = new TextEncoder().encode("your-secret-key");

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // Allow unauthenticated access to /login and static files
  if (req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(token, SECRET_KEY); // Validate the JWT
    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico|api/public).*)",
  ],
};
