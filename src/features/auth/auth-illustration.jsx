"use client";

import { LeafMark } from "@/components/brand/logo";

export function AuthScene() {
  return (
    <svg
      viewBox="0 0 760 1000"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="auth-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6faf3" />
          <stop offset="62%" stopColor="#eef7ee" />
          <stop offset="100%" stopColor="#e5f2e7" />
        </linearGradient>
        <linearGradient id="auth-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4e7d8" />
          <stop offset="100%" stopColor="#c3ddca" />
        </linearGradient>
        <linearGradient id="auth-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b3d4bd" />
          <stop offset="100%" stopColor="#97c3a5" />
        </linearGradient>
        <linearGradient id="auth-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8cb798" />
          <stop offset="100%" stopColor="#6fa37f" />
        </linearGradient>
        <linearGradient id="auth-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dfeee4" />
          <stop offset="55%" stopColor="#d3e8da" />
          <stop offset="100%" stopColor="#c4ded0" />
        </linearGradient>
        <linearGradient id="auth-shore" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6f9d7d" />
          <stop offset="100%" stopColor="#4d7b5e" />
        </linearGradient>
        <radialGradient id="auth-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="auth-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="auth-mist" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <g id="auth-pine">
          <path d="M0 0 11 30 4 30 17 58 8 58 22 88-22 88-8 58-17 58-4 30-11 30Z" fill="#486f57" />
        </g>
      </defs>

      <rect width="760" height="1000" fill="url(#auth-sky)" />
      <ellipse cx="600" cy="180" rx="260" ry="180" fill="url(#auth-glow)" />

      <g filter="url(#auth-soft)" opacity="0.9">
        <path d="M0 520 82 424 154 476 238 382 330 478 424 405 512 482 604 410 694 478 760 432V1000H0Z" fill="url(#auth-far)" />
      </g>

      <path d="M0 576c73-48 130-50 197-13 64-59 130-63 199-6 63-49 128-48 193 3 66-40 116-33 171 8V1000H0Z" fill="url(#auth-mid)" opacity="0.92" />
      <path d="M0 630c87-51 157-37 228 0 79-52 146-53 221-1 86-43 176-38 311 8V1000H0Z" fill="url(#auth-near)" opacity="0.9" />

      <g opacity="0.42" filter="url(#auth-mist)">
        <ellipse cx="250" cy="506" rx="240" ry="32" fill="#f8fcf7" />
        <ellipse cx="610" cy="548" rx="210" ry="26" fill="#f8fcf7" />
      </g>

      <path d="M0 652c95-30 177-24 259 6 97-34 190-30 282 6 79-27 148-22 219 4V1000H0Z" fill="url(#auth-water)" />

      <g opacity="0.3">
        <path d="M130 720c48-10 91-10 136 0M348 686c46-9 89-9 134 0M520 744c56-12 107-12 162 0M78 796c63-13 120-13 181 0M330 826c62-14 121-14 181 0M520 866c55-11 103-11 154 0" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
        <path d="M180 690v220M420 656v250M620 704v208" stroke="#a9ccb6" strokeWidth="7" strokeLinecap="round" opacity="0.34" />
      </g>

      <path d="M0 640c42 18 74 44 99 80 17 25 20 47 14 72-3 15-20 26-36 22-49-12-91-56-116-112-9-20-8-41 7-56 8-8 20-11 32-6Z" fill="#5d8f70" opacity="0.8" />
      <path d="M760 616c-54 14-102 44-131 85-15 21-18 46-4 62 15 18 47 15 72-4 44-34 76-82 87-127 4-14-3-21-24-16Z" fill="#557f63" opacity="0.65" />

      <g opacity="0.94">
        <use href="#auth-pine" transform="translate(548 552) scale(1.18)" />
        <use href="#auth-pine" transform="translate(590 538) scale(1.5)" />
        <use href="#auth-pine" transform="translate(639 546) scale(1.25)" />
        <use href="#auth-pine" transform="translate(680 526) scale(1.7)" />
        <use href="#auth-pine" transform="translate(731 546) scale(1.28)" />
        <use href="#auth-pine" transform="translate(500 568) scale(0.9)" />
        <use href="#auth-pine" transform="translate(464 580) scale(0.72)" />
      </g>

      <g opacity="0.55">
        <use href="#auth-pine" transform="translate(84 596) scale(0.72)" />
        <use href="#auth-pine" transform="translate(126 590) scale(0.92)" />
        <use href="#auth-pine" transform="translate(170 600) scale(0.66)" />
      </g>

      <path d="M0 958c80-14 149-4 210 26 48 24 84 55 103 96H0Z" fill="url(#auth-shore)" opacity="0.22" />
      <path d="M0 900c120 6 215 34 291 86" stroke="#f6fbf7" strokeWidth="2" opacity="0.4" fill="none" />

      <g opacity="0.55" filter="url(#auth-mist)">
        <ellipse cx="390" cy="780" rx="280" ry="88" fill="#eff8f1" />
      </g>
    </svg>
  );
}

export function AuthIllustration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AuthScene />
      <div className="absolute -left-24 -top-20 rotate-[12deg] opacity-[0.11]">
        <LeafMark size={280} id="auth-corner-top" />
      </div>
      <div className="absolute -bottom-24 -right-16 rotate-[-18deg] opacity-[0.09]">
        <LeafMark size={300} id="auth-corner-bottom" />
      </div>
    </div>
  );
}
