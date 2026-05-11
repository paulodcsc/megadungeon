"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get("next") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase: pw }),
    });
    setPending(false);
    if (!res.ok) {
      setError(res.status === 401 ? "Wrong passphrase." : "Something went wrong.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 w-full max-w-sm">
      <input
        type="password"
        autoFocus
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Passphrase"
        className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
      />
      <button
        type="submit"
        disabled={pending || !pw}
        className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50"
      >
        {pending ? "Checking…" : "Enter"}
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Megadungeon</h1>
      <p className="text-zinc-400 text-sm">Enter the group passphrase to continue.</p>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
