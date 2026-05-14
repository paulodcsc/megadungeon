"use client";

import { useStore } from "@/lib/store";
import type { Tool } from "@/lib/types";

const tools: { id: Tool; label: string; hint: string }[] = [
  { id: "select", label: "Select", hint: "V — drag tokens, click to select" },
  { id: "pan", label: "Pan", hint: "H — drag the map" },
  { id: "token", label: "Token", hint: "T — click to drop a token" },
  { id: "wall", label: "Wall", hint: "W — click points, Enter/double-click to finish" },
  { id: "shadow", label: "Shadow", hint: "S — drag a rectangle" },
];

export function Toolbar() {
  const tool = useStore((s) => s.tool);
  const setTool = useStore((s) => s.setTool);
  const setMapUrl = useStore((s) => s.setMapUrl);
  const reset = useStore((s) => s.reset);
  const sceneId = useStore((s) => s.sceneId);

  function onPickMap(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMapUrl(url);
  }

  return (
    <div className="flex items-center gap-2 p-2 border-b border-zinc-800 bg-zinc-950">
      <div className="font-semibold text-zinc-200 mr-3">
        Megadungeon <span className="text-zinc-500 text-sm">/ {sceneId}</span>
      </div>
      <div className="flex gap-1">
        {tools.map((t) => (
          <button
            key={t.id}
            title={t.hint}
            onClick={() => setTool(t.id)}
            className={
              "px-3 py-1.5 rounded text-sm font-medium border " +
              (tool === t.id
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800")
            }
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <label className="px-3 py-1.5 rounded text-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer">
          Load map
          <input type="file" accept="image/*" className="hidden" onChange={onPickMap} />
        </label>
        <button
          onClick={() => {
            if (confirm("Clear this scene?")) reset();
          }}
          className="px-3 py-1.5 rounded text-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
        >
          Clear
        </button>
        <button
          onClick={async () => {
            await fetch("/api/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="px-3 py-1.5 rounded text-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
