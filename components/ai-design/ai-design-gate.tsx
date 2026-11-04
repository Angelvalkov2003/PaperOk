"use client";

import { AiDesignStudio } from "components/ai-design/ai-design-studio";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AiDesignGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-design/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Грешна парола");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Грешка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-paper-border bg-white/85 p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-paper-heading">
        AI дизайн — тестов достъп
      </h1>
      <p className="mt-2 text-sm text-paper-text">
        Функцията е скрита за посетители. Въведете preview паролата, за да
        продължите тестовете.
      </p>
      <form onSubmit={unlock} className="mt-5 space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Парола"
          className="w-full rounded-xl border border-paper-border px-3 py-2 text-sm outline-none focus:border-paper-green"
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? "…" : "Отключи"}
        </button>
      </form>
    </div>
  );
}

export function AiDesignUnlocked() {
  return <AiDesignStudio />;
}
