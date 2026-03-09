"use client";

import { useState } from "react";
import BadgeForm from "@/app/components/BadgeForm";
import BadgeCard from "@/app/components/BadgeCard";
import BadgeMini from "@/app/components/BadgeMini";
import { BadgeData } from "@/app/types/badge";

export default function Home() {
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  async function handleAddToGoogleWallet() {
    if (!badge) return;
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const res = await fetch("/api/google-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: badge.id,
          name: badge.name,
          age: badge.age,
          title: badge.title,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      window.open(data.saveUrl, "_blank");
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "Failed to create pass");
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleAddToAppleWallet() {
    alert("Apple Wallet integration coming in Step 3!");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Badge Generator
      </h1>
      <p className="text-gray-500 mb-10 text-center text-sm">
        Fill in your details to generate a digital badge
      </p>

      {!badge ? (
        <BadgeForm onSubmit={setBadge} />
      ) : (
        <div className="flex flex-col items-center gap-10 w-full">
          {/* Cards row */}
          <div className="flex flex-col md:flex-row gap-10 items-start justify-center w-full">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                ID Card
              </p>
              <BadgeCard badge={badge} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Wallet Badge
              </p>
              <BadgeMini
                badge={badge}
                onAddToGoogleWallet={handleAddToGoogleWallet}
                googleLoading={googleLoading}
                onAddToAppleWallet={handleAddToAppleWallet}
              />
              {googleError && (
                <p className="text-xs text-red-500 mt-1 text-center max-w-[256px]">
                  {googleError}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setBadge(null)}
            className="text-sm text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
          >
            ← Create a new badge
          </button>
        </div>
      )}
    </div>
  );
}
