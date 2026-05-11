"use client";

import dynamic from "next/dynamic";

const SceneView = dynamic(() => import("./SceneView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen text-zinc-500">Loading scene…</div>
  ),
});

export default function SceneViewClient({ sceneId }: { sceneId: string }) {
  return <SceneView sceneId={sceneId} />;
}
