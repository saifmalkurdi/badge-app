"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { BadgeData } from "@/app/types/badge";

interface BadgeFormProps {
  onSubmit: (badge: BadgeData) => void;
}

export default function BadgeForm({ onSubmit }: BadgeFormProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageUrl(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const badge: BadgeData = {
      id: uuidv4(),
      name,
      age,
      title,
      imageUrl,
    };
    onSubmit(badge);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col gap-5"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Create Your Badge
      </h2>

      {/* Image Upload */}
      <div className="flex flex-col items-center gap-2">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:bg-gray-100 transition"
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="preview"
              width={96}
              height={96}
              className="w-full h-full object-cover rounded-full"
              unoptimized
            />
          ) : (
            <span className="text-gray-400 text-xs text-center px-2">
              Upload Photo
            </span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <span className="text-xs text-gray-400">
          Click avatar to upload photo
        </span>
      </div>

      {/* Full Name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Doe"
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Age */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Age</label>
        <input
          type="number"
          required
          min={1}
          max={120}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="e.g. 28"
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Title / Role
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Software Engineer"
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <button
        type="submit"
        className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
      >
        Generate Badge
      </button>
    </form>
  );
}
