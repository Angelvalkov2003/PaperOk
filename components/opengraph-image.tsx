import { ImageResponse } from "next/og";
import { SITE_NAME } from "lib/constants";
import { join } from "path";
import { readFile } from "fs/promises";

export type Props = {
  title?: string;
};

export default async function OpengraphImage(
  props?: Props,
): Promise<ImageResponse> {
  const { title } = {
    title: SITE_NAME,
    ...props,
  };

  const [fontFile, logoFile] = await Promise.all([
    readFile(join(process.cwd(), "./fonts/Inter-Bold.ttf")).catch(() => null),
    readFile(join(process.cwd(), "public", "logo.jpeg")),
  ]);

  const logoSrc = `data:image/jpeg;base64,${logoFile.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F5EC",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={SITE_NAME}
          width={520}
          height={252}
          style={{ objectFit: "contain" }}
        />
        {title !== SITE_NAME ? (
          <p
            style={{
              marginTop: 40,
              fontSize: 48,
              fontWeight: 700,
              color: "#403B32",
              fontFamily: fontFile ? "Inter" : "sans-serif",
            }}
          >
            {title}
          </p>
        ) : null}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontFile
        ? [
            {
              name: "Inter",
              data: Uint8Array.from(fontFile).buffer,
              style: "normal" as const,
              weight: 700 as const,
            },
          ]
        : [],
    },
  );
}
