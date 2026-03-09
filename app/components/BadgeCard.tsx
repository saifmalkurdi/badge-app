import Image from "next/image";
import { BadgeData } from "@/app/types/badge";

interface BadgeCardProps {
  badge: BadgeData;
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-72">
      {/* Gradient header with avatar */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 h-24 relative">
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gray-200">
            {badge.imageUrl ? (
              <Image
                src={badge.imageUrl}
                alt={badge.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                👤
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pt-12 pb-6 px-6 flex flex-col items-center gap-1 text-center">
        <span className="text-lg font-bold text-gray-900">{badge.name}</span>
        <span className="text-sm font-medium text-indigo-600">
          {badge.title}
        </span>
        <span className="text-sm text-gray-500">Age: {badge.age}</span>

        {/* UUID */}
        <div className="mt-4 w-full border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
            Badge ID
          </p>
          <p className="text-xs font-mono text-gray-500 break-all">
            {badge.id}
          </p>
        </div>
      </div>
    </div>
  );
}
