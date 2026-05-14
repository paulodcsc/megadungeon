import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Megadungeon</h1>
      <p className="text-zinc-400 max-w-md text-center">
        A tiny self-hosted VTT. Pick a scene to start a session.
      </p>
      <div className="flex gap-3">
        <Link
          href="/scene/demo"
          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
        >
          Open demo scene
        </Link>
      </div>
      <p className="text-zinc-500 text-sm">
        Tip: share <code className="text-zinc-300">/scene/&lt;id&gt;</code> with your players.
      </p>
    </main>
  );
}
