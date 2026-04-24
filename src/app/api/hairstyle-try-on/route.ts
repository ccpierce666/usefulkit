import { NextRequest, NextResponse } from "next/server";

type RequestBody = {
  imageDataUrl?: string;
  styleId?: string;
  color?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const imageDataUrl = body.imageDataUrl?.trim() ?? "";
    const styleId = body.styleId?.trim() ?? "";
    const color = body.color?.trim() ?? "";

    if (!imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Invalid image payload. Please upload a PNG, JPG, or WebP image." },
        { status: 400 },
      );
    }

    const providerUrl = process.env.HAIRSTYLE_PROVIDER_URL;
    const providerKey = process.env.HAIRSTYLE_PROVIDER_KEY;

    if (providerUrl && providerKey) {
      const upstream = await fetch(providerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${providerKey}`,
        },
        body: JSON.stringify({
          imageDataUrl,
          styleId,
          color,
        }),
      });

      if (!upstream.ok) {
        const text = await upstream.text();
        return NextResponse.json(
          { error: "Provider request failed.", details: text.slice(0, 500) },
          { status: 502 },
        );
      }

      const data = (await upstream.json()) as { outputImageDataUrl?: string };
      if (!data.outputImageDataUrl?.startsWith("data:image/")) {
        return NextResponse.json(
          { error: "Provider returned invalid output format." },
          { status: 502 },
        );
      }

      return NextResponse.json({
        mode: "provider",
        outputImageDataUrl: data.outputImageDataUrl,
      });
    }

    return NextResponse.json({
      mode: "demo",
      outputImageDataUrl: imageDataUrl,
      notes: [
        "No upstream hairstyle model configured.",
        "Set HAIRSTYLE_PROVIDER_URL and HAIRSTYLE_PROVIDER_KEY to enable AI output.",
      ],
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected request error. Please try again." },
      { status: 500 },
    );
  }
}

