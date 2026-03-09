"use client";

import Image from "next/image";
import QRCode from "react-qr-code";
import { BadgeData } from "@/app/types/badge";

interface BadgeMiniProps {
  badge: BadgeData;
  onAddToGoogleWallet: () => void;
  googleLoading?: boolean;
  onAddToAppleWallet: () => void;
}

export default function BadgeMini({
  badge,
  onAddToGoogleWallet,
  googleLoading = false,
  onAddToAppleWallet,
}: BadgeMiniProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mini badge card */}
      <div className="bg-white rounded-2xl shadow-xl p-5 w-64 flex flex-col items-center gap-4">
        {/* Top row: avatar + info */}
        <div className="flex items-center gap-3 w-full">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-indigo-200">
            {badge.imageUrl ? (
              <Image
                src={badge.imageUrl}
                alt={badge.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">
                👤
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-gray-900 truncate">
              {badge.name}
            </span>
            <span className="text-xs font-medium text-indigo-600 truncate">
              {badge.title}
            </span>
            <span className="text-xs text-gray-500">Age {badge.age}</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
          <QRCode value={badge.id} size={110} />
        </div>

        {/* Truncated ID */}
        <p className="text-xs text-gray-400 font-mono text-center">
          {badge.id.slice(0, 8)}…{badge.id.slice(-4)}
        </p>
      </div>

      {/* Wallet buttons */}
      <div className="flex flex-col gap-2 w-64">
        <button
          onClick={onAddToGoogleWallet}
          disabled={googleLoading}
          className="flex items-center justify-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition text-sm cursor-pointer"
        >
          {googleLoading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          )}
          {googleLoading ? "Generating pass…" : "Add to Google Wallet"}
        </button>
        <button
          onClick={onAddToAppleWallet}
          className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-xl transition text-sm cursor-pointer"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 fill-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          Add to Apple Wallet
        </button>
      </div>
    </div>
  );
}
