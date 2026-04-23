import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "UsefulKit free online tools";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 20% 20%, #dbeafe 0, #e2e8f0 35%, #f8fafc 100%)",
          color: "#0f172a",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, color: "#2563eb" }}>UsefulKit</div>
        <div style={{ marginTop: 22, fontSize: 72, fontWeight: 800, lineHeight: 1.06 }}>
          Free Online Tools
        </div>
        <div style={{ marginTop: 20, fontSize: 34, color: "#334155" }}>
          Fast, simple, privacy-friendly
        </div>
      </div>
    ),
    size,
  );
}
