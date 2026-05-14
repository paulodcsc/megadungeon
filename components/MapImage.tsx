"use client";

import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";

export function MapImage({ url }: { url: string }) {
  const [img] = useImage(url, "anonymous");
  if (!img) return null;
  return <KonvaImage image={img} x={0} y={0} listening={false} />;
}
