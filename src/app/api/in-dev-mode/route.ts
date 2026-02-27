import { NextResponse } from "next/server";

export async function GET() {
    const inDevMode = process.env.DEVELOPMENT === 'true';
    return NextResponse.json({ inDevMode });
}