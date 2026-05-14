"use client";

import { useEffect } from "react";
import { Toolbar } from "./Toolbar";
import { SceneCanvas } from "./SceneCanvas";
import { useStore } from "@/lib/store";
import { useRealtime } from "@/lib/useRealtime";
import type { Tool } from "@/lib/types";

export default function SceneView({ sceneId }: { sceneId: string }) {
  const setSceneId = useStore((s) => s.setSceneId);
  const setTool = useStore((s) => s.setTool);

  useEffect(() => {
    setSceneId(sceneId);
  }, [sceneId, setSceneId]);

  useRealtime(sceneId);

  // Tool hotkeys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const map: Record<string, Tool> = { v: "select", h: "pan", t: "token", w: "wall", s: "shadow" };
      const next = map[e.key.toLowerCase()];
      if (next) setTool(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTool]);

  return (
    <div className="flex flex-col h-screen">
      <Toolbar />
      <div className="flex-1 relative overflow-hidden">
        <SceneCanvas />
      </div>
    </div>
  );
}
