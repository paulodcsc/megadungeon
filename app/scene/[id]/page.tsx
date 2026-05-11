import SceneViewClient from "@/components/SceneViewClient";

export default async function ScenePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SceneViewClient sceneId={id} />;
}
