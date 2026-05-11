"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Circle, Layer, Line, Rect, Stage, Text } from "react-konva";
import type Konva from "konva";
import { useStore } from "@/lib/store";
import { MapImage } from "./MapImage";

const TOKEN_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function SceneCanvas() {
  const tool = useStore((s) => s.tool);
  const scene = useStore((s) => s.scene);
  const selection = useStore((s) => s.selection);
  const setSelection = useStore((s) => s.setSelection);
  const addToken = useStore((s) => s.addToken);
  const updateToken = useStore((s) => s.updateToken);
  const removeToken = useStore((s) => s.removeToken);
  const addWall = useStore((s) => s.addWall);
  const removeWall = useStore((s) => s.removeWall);
  const addShadow = useStore((s) => s.addShadow);
  const removeShadow = useStore((s) => s.removeShadow);

  const stageRef = useRef<Konva.Stage | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
  const [wallPoints, setWallPoints] = useState<number[]>([]);
  const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number } | null>(null);
  const [shadowDraft, setShadowDraft] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const shadowStart = useRef<{ x: number; y: number } | null>(null);

  // Fit to container.
  useEffect(() => {
    const el = stageRef.current?.container().parentElement;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function toWorld(clientX: number, clientY: number) {
    return {
      x: (clientX - camera.x) / camera.scale,
      y: (clientY - camera.y) / camera.scale,
    };
  }

  function onWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    const scaleBy = 1.08;
    const oldScale = camera.scale;
    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - camera.x) / oldScale,
      y: (pointer.y - camera.y) / oldScale,
    };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(8, Math.max(0.1, direction > 0 ? oldScale * scaleBy : oldScale / scaleBy));
    setCamera({
      scale: newScale,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }

  function onStageMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Middle/right-button or pan tool: let Stage draggable handle it.
    if (e.evt.button === 1 || e.evt.button === 2 || tool === "pan") return;

    const world = toWorld(pointer.x, pointer.y);
    const clickedEmpty = e.target === stage;

    if (tool === "token") {
      addToken({
        id: uid(),
        x: world.x,
        y: world.y,
        color: TOKEN_COLORS[Math.floor(Math.random() * TOKEN_COLORS.length)],
        label: "",
        size: 22,
      });
      return;
    }

    if (tool === "wall") {
      setWallPoints((prev) => [...prev, world.x, world.y]);
      return;
    }

    if (tool === "shadow") {
      shadowStart.current = world;
      setShadowDraft({ x: world.x, y: world.y, w: 0, h: 0 });
      return;
    }

    if (tool === "select" && clickedEmpty) {
      setSelection(null);
    }
  }

  function onStageMouseMove() {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const world = toWorld(pointer.x, pointer.y);
    setCursorWorld(world);

    if (tool === "shadow" && shadowStart.current) {
      const s = shadowStart.current;
      setShadowDraft({
        x: Math.min(s.x, world.x),
        y: Math.min(s.y, world.y),
        w: Math.abs(world.x - s.x),
        h: Math.abs(world.y - s.y),
      });
    }
  }

  function onStageMouseUp() {
    if (tool === "shadow" && shadowDraft) {
      if (shadowDraft.w > 3 && shadowDraft.h > 3) {
        addShadow({
          id: uid(),
          x: shadowDraft.x,
          y: shadowDraft.y,
          width: shadowDraft.w,
          height: shadowDraft.h,
        });
      }
      shadowStart.current = null;
      setShadowDraft(null);
    }
  }

  function commitWall() {
    if (wallPoints.length >= 4) {
      addWall({ id: uid(), points: wallPoints });
    }
    setWallPoints([]);
  }

  function onStageDblClick() {
    if (tool === "wall") commitWall();
  }

  // Keyboard: Enter to commit wall, Esc to cancel, Delete to remove selection.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === "Enter" && tool === "wall") commitWall();
      if (e.key === "Escape") setWallPoints([]);
      if ((e.key === "Delete" || e.key === "Backspace") && selection) {
        if (selection.kind === "token") removeToken(selection.id);
        if (selection.kind === "wall") removeWall(selection.id);
        if (selection.kind === "shadow") removeShadow(selection.id);
        setSelection(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, wallPoints, selection]);

  const panMode = tool === "pan";
  const previewWallPoints =
    wallPoints.length && cursorWorld ? [...wallPoints, cursorWorld.x, cursorWorld.y] : wallPoints;

  return (
    <Stage
      ref={stageRef}
      width={size.w}
      height={size.h}
      x={camera.x}
      y={camera.y}
      scaleX={camera.scale}
      scaleY={camera.scale}
      draggable={panMode}
      onDragEnd={(e) => {
        if (e.target === stageRef.current) {
          setCamera((c) => ({ ...c, x: e.target.x(), y: e.target.y() }));
        }
      }}
      onWheel={onWheel}
      onMouseDown={onStageMouseDown}
      onMouseMove={onStageMouseMove}
      onMouseUp={onStageMouseUp}
      onDblClick={onStageDblClick}
      onContextMenu={(e) => e.evt.preventDefault()}
      style={{ background: "#111114", cursor: cursorFor(tool) }}
    >
      <Layer listening={!panMode}>
        {scene.mapUrl && <MapImage url={scene.mapUrl} />}

        {/* Shadows (drawn under walls and tokens so walls/tokens stay visible). */}
        {scene.shadows.map((sh) => {
          const isSelected = selection?.kind === "shadow" && selection.id === sh.id;
          return (
            <Rect
              key={sh.id}
              x={sh.x}
              y={sh.y}
              width={sh.width}
              height={sh.height}
              fill="#000"
              opacity={0.7}
              stroke={isSelected ? "#10b981" : undefined}
              strokeWidth={isSelected ? 2 / camera.scale : 0}
              onClick={() => tool === "select" && setSelection({ kind: "shadow", id: sh.id })}
              onTap={() => tool === "select" && setSelection({ kind: "shadow", id: sh.id })}
            />
          );
        })}

        {/* Walls. */}
        {scene.walls.map((w) => {
          const isSelected = selection?.kind === "wall" && selection.id === w.id;
          return (
            <Line
              key={w.id}
              points={w.points}
              stroke={isSelected ? "#10b981" : "#0f0f12"}
              strokeWidth={6 / camera.scale}
              lineCap="round"
              lineJoin="round"
              hitStrokeWidth={Math.max(10, 12 / camera.scale)}
              onClick={() => tool === "select" && setSelection({ kind: "wall", id: w.id })}
              onTap={() => tool === "select" && setSelection({ kind: "wall", id: w.id })}
            />
          );
        })}

        {/* Tokens. */}
        {scene.tokens.map((t) => {
          const isSelected = selection?.kind === "token" && selection.id === t.id;
          return (
            <Fragment key={t.id}>
              <Circle
                x={t.x}
                y={t.y}
                radius={t.size}
                fill={t.color}
                stroke={isSelected ? "#ffffff" : "#0a0a0c"}
                strokeWidth={isSelected ? 3 / camera.scale : 2 / camera.scale}
                shadowColor="#000"
                shadowBlur={6}
                shadowOpacity={0.5}
                draggable={tool === "select"}
                onClick={() => tool === "select" && setSelection({ kind: "token", id: t.id })}
                onTap={() => tool === "select" && setSelection({ kind: "token", id: t.id })}
                onDragMove={(e) =>
                  updateToken(t.id, { x: e.target.x(), y: e.target.y() })
                }
              />
              {t.label && (
                <Text
                  text={t.label}
                  x={t.x - 40}
                  y={t.y + t.size + 4}
                  width={80}
                  align="center"
                  fill="#fff"
                  fontSize={12 / camera.scale}
                  listening={false}
                />
              )}
            </Fragment>
          );
        })}

        {/* In-progress wall preview. */}
        {tool === "wall" && previewWallPoints.length >= 2 && (
          <Line
            points={previewWallPoints}
            stroke="#10b981"
            strokeWidth={6 / camera.scale}
            dash={[10 / camera.scale, 6 / camera.scale]}
            lineCap="round"
            lineJoin="round"
            listening={false}
          />
        )}

        {/* In-progress shadow rectangle. */}
        {tool === "shadow" && shadowDraft && (
          <Rect
            x={shadowDraft.x}
            y={shadowDraft.y}
            width={shadowDraft.w}
            height={shadowDraft.h}
            fill="#000"
            opacity={0.5}
            stroke="#10b981"
            strokeWidth={1 / camera.scale}
            listening={false}
          />
        )}
      </Layer>
    </Stage>
  );
}

function cursorFor(tool: string) {
  if (tool === "pan") return "grab";
  if (tool === "token" || tool === "wall" || tool === "shadow") return "crosshair";
  return "default";
}
