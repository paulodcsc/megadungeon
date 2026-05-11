import { NextResponse } from "next/server";
import { signSession, timingSafeEqualStr } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
  const passphrase = process.env.APP_PASSPHRASE;
  const secret = process.env.SESSION_SECRET;
  if (!passphrase || !secret) {
    return new NextResponse("Auth not configured", { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as { passphrase?: string } | null;
  if (!body?.passphrase) return new NextResponse("Missing passphrase", { status: 400 });

  if (!timingSafeEqualStr(body.passphrase, passphrase)) {
    return new NextResponse("Wrong passphrase", { status: 401 });
  }

  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const token = await signSession(exp, secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("mdg_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(exp),
  });
  return res;
}
