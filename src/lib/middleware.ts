import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "./auth";

export async function apiAuth(roles?: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return { authenticated: false, errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { authenticated: false, errorResponse: NextResponse.json({ error: "Invalid session" }, { status: 401 }) };
  }

  if (roles && !roles.includes(decoded.role)) {
    return { authenticated: false, errorResponse: NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 }) };
  }

  return { authenticated: true, user: decoded };
}
