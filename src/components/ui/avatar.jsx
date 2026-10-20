"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";

const PALETTES = [
  ["#DDF1E5", "#1C6B47"],
  ["#E5EEE8", "#315D49"],
  ["#F1EBDD", "#6B5424"],
  ["#E7EAE3", "#4A5A3B"],
];

function paletteFor(name) {
  const seed = String(name || "R")
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return PALETTES[seed % PALETTES.length];
}

export default function Avatar({ src, name, username, avatarUrl, size = 44, className }) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = src || avatarUrl;
  const resolvedName = name || username;
  const [background, foreground] = paletteFor(resolvedName);
  const showImage = Boolean(resolvedSrc) && !failed;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-reset-soft font-bold shadow-sm",
        className
      )}
      style={{
        width: size,
        height: size,
        background: showImage ? undefined : background,
        color: foreground,
        fontSize: Math.max(11, size * 0.34),
      }}
    >
      {showImage ? (
        <img
          src={resolvedSrc}
          alt={resolvedName ? `Foto profil ${resolvedName}` : "Foto profil"}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials(resolvedName)}</span>
      )}
    </div>
  );
}