import { NextResponse } from "next/server";

export async function GET() {
  const pk =
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ||
    process.env.MERCADOPAGO_PUBLIC_KEY;
  if (!pk) {
    return NextResponse.json(
      { error: "Public key not configured" },
      { status: 500 }
    );
  }
  return NextResponse.json({ publicKey: pk });
}


