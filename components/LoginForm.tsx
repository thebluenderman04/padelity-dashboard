"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PublicBrand {
  id: string;
  name: string;
  tagline: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [brands, setBrands] = useState<PublicBrand[]>([]);
  const [brandId, setBrandId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data: PublicBrand[]) => {
        setBrands(data);
        if (data.length > 0) setBrandId(data[0].id);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand: brandId, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push(`/${brandId}/overview`);
    } else {
      const data = await res.json();
      setError(data.error ?? "Invalid credentials");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Brand selector */}
      <div>
        <label
          htmlFor="brand"
          className="block text-xs font-medium text-ink-muted uppercase tracking-widest mb-2"
        >
          Brand
        </label>
        <select
          id="brand"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="w-full h-11 px-3 rounded-xl border border-border bg-canvas text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
          }}
        >
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-xs font-medium text-ink-muted uppercase tracking-widest mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••"
          required
          className="w-full h-11 px-3 rounded-xl border border-border bg-canvas text-ink text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-negative text-sm text-center bg-red-50 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !brandId}
        className="w-full h-11 rounded-xl bg-ink text-white text-sm font-medium tracking-wide hover:bg-zinc-800 active:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
