import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/**
 * Same-origin proxy so admin logo uploads do not hit cross-origin CORS failures.
 * Files are still stored on the API server under /uploads/logos.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get("authorization");
  if (!auth) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const response = await fetch(`${API_BASE}/uploads/logo`, {
      method: "POST",
      headers: {
        Authorization: auth,
      },
      body: formData,
    });

    const text = await response.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      // keep text
    }

    if (!response.ok) {
      const message =
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        (body as { message?: string | string[] }).message
          ? Array.isArray((body as { message: string | string[] }).message)
            ? (body as { message: string[] }).message.join(", ")
            : (body as { message: string }).message
          : "Logo upload failed on the API.";
      return NextResponse.json({ message }, { status: response.status });
    }

    return NextResponse.json(body);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not reach the API to store the logo.";
    return NextResponse.json(
      {
        message: `Upload failed: ${message}. Deploy/restart the API if /uploads/logo is missing.`,
      },
      { status: 502 },
    );
  }
}
