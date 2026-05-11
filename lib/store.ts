"use client";

import { create } from "zustand";
import type { SceneState, Shadow, Token, Tool, Wall } from "./types";

type Selection =
  | { kind: "token"; id: string }
  | { kind: "wall"; id: string }
  | { kind: "shadow"; id: string }
  | null;

type Store = {
  sceneId: string;
  tool: Tool;
  selection: Selection;
  scene: SceneState;
  setSceneId: (id: string) => void;
  setTool: (t: Tool) => void;
  setSelection: (s: Selection) => void;
  setMapUrl: (url: string | null) => void;
  addToken: (t: Token) => void;
  updateToken: (id: string, patch: Partial<Token>) => void;
  removeToken: (id: string) => void;
  addWall: (w: Wall) => void;
  removeWall: (id: string) => void;
  addShadow: (s: Shadow) => void;
  updateShadow: (id: string, patch: Partial<Shadow>) => void;
  removeShadow: (id: string) => void;
  replaceScene: (s: SceneState) => void;
  reset: () => void;
};

const empty: SceneState = { mapUrl: null, tokens: [], walls: [], shadows: [] };

export const useStore = create<Store>((set) => ({
  sceneId: "demo",
  tool: "select",
  selection: null,
  scene: empty,
  setSceneId: (id) => set({ sceneId: id }),
  setTool: (tool) => set({ tool, selection: null }),
  setSelection: (selection) => set({ selection }),
  setMapUrl: (mapUrl) => set((s) => ({ scene: { ...s.scene, mapUrl } })),
  addToken: (t) => set((s) => ({ scene: { ...s.scene, tokens: [...s.scene.tokens, t] } })),
  updateToken: (id, patch) =>
    set((s) => ({
      scene: {
        ...s.scene,
        tokens: s.scene.tokens.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      },
    })),
  removeToken: (id) =>
    set((s) => ({ scene: { ...s.scene, tokens: s.scene.tokens.filter((t) => t.id !== id) } })),
  addWall: (w) => set((s) => ({ scene: { ...s.scene, walls: [...s.scene.walls, w] } })),
  removeWall: (id) =>
    set((s) => ({ scene: { ...s.scene, walls: s.scene.walls.filter((w) => w.id !== id) } })),
  addShadow: (sh) => set((s) => ({ scene: { ...s.scene, shadows: [...s.scene.shadows, sh] } })),
  updateShadow: (id, patch) =>
    set((s) => ({
      scene: {
        ...s.scene,
        shadows: s.scene.shadows.map((sh) => (sh.id === id ? { ...sh, ...patch } : sh)),
      },
    })),
  removeShadow: (id) =>
    set((s) => ({ scene: { ...s.scene, shadows: s.scene.shadows.filter((sh) => sh.id !== id) } })),
  replaceScene: (scene) => set({ scene }),
  reset: () => set({ scene: empty, selection: null }),
}));
