"use client";

import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import { useStore } from "./store";
import type { SceneState } from "./types";

const clientId =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function useRealtime(sceneId: string) {
  const replaceScene = useStore((s) => s.replaceScene);
  const scene = useStore((s) => s.scene);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const applyingRemote = useRef(false);
  const lastSent = useRef<string>("");

  // Load from localStorage on mount.
  useEffect(() => {
    const key = `megadungeon:scene:${sceneId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as SceneState;
        applyingRemote.current = true;
        replaceScene(parsed);
        applyingRemote.current = false;
      }
    } catch {}
  }, [sceneId, replaceScene]);

  // Persist locally on change.
  useEffect(() => {
    const key = `megadungeon:scene:${sceneId}`;
    try {
      localStorage.setItem(key, JSON.stringify(scene));
    } catch {}
  }, [sceneId, scene]);

  // Subscribe to Supabase channel (no-op if env not set).
  useEffect(() => {
    const supa = getSupabase();
    if (!supa) return;
    const channel = supa.channel(`scene:${sceneId}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel.on("broadcast", { event: "state" }, (payload) => {
      const msg = payload.payload as { from: string; scene: SceneState };
      if (msg.from === clientId) return;
      applyingRemote.current = true;
      replaceScene(msg.scene);
      applyingRemote.current = false;
    });

    channel.on("broadcast", { event: "request" }, (payload) => {
      const msg = payload.payload as { from: string };
      if (msg.from === clientId) return;
      const current = useStore.getState().scene;
      channel.send({
        type: "broadcast",
        event: "state",
        payload: { from: clientId, scene: current },
      });
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.send({
          type: "broadcast",
          event: "request",
          payload: { from: clientId },
        });
      }
    });

    return () => {
      supa.removeChannel(channel);
      channelRef.current = null;
    };
  }, [sceneId, replaceScene]);

  // Broadcast local changes (debounced).
  useEffect(() => {
    if (!channelRef.current) return;
    if (applyingRemote.current) return;
    const serialized = JSON.stringify(scene);
    if (serialized === lastSent.current) return;
    const ch = channelRef.current;
    const t = setTimeout(() => {
      lastSent.current = serialized;
      ch.send({
        type: "broadcast",
        event: "state",
        payload: { from: clientId, scene },
      });
    }, 80);
    return () => clearTimeout(t);
  }, [scene]);
}
