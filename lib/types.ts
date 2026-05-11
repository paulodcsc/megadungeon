export type Tool = "select" | "token" | "wall" | "shadow" | "pan";

export type Token = {
  id: string;
  x: number;
  y: number;
  color: string;
  label: string;
  size: number;
};

export type Wall = {
  id: string;
  points: number[]; // flat [x1,y1,x2,y2,...]
};

export type Shadow = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SceneState = {
  mapUrl: string | null;
  tokens: Token[];
  walls: Wall[];
  shadows: Shadow[];
};
