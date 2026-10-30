import type { ReactNode } from 'react';

export type SearchIconName =
  | 'idCard'
  | 'user'
  | 'userCheck'
  | 'calendar'
  | 'caretDown'
  | 'caretUp'
  | 'reset'
  | 'sliders'
  | 'search'
  | 'check'
  | 'stethoscope'
  | 'tag'
  | 'article';

const ICONS: Record<SearchIconName, ReactNode> = {
  idCard: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M15 9h3M15 13h3M6 16c.5-1.5 1.8-2 3-2s2.5.5 3 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </>
  ),
  userCheck: (
    <>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M16 11l2 2 4-4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </>
  ),
  caretDown: <path d="M6 9l6 6 6-6" />,
  caretUp: <path d="M6 15l6-6 6 6" />,
  reset: (
    <>
      <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
  sliders: <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  check: <path d="M5 13l4 4L19 7" />,
  stethoscope: (
    <>
      <path d="M11 2v2M5 2v2M5 3H4a2 2 0 00-2 2v4a6 6 0 0012 0V5a2 2 0 00-2-2h-1" />
      <path d="M8 15a6 6 0 0012 0v-3" />
      <circle cx="20" cy="10" r="2" />
    </>
  ),
  tag: (
    <>
      <path d="M12.586 2.586A2 2 0 0011.172 2H4a2 2 0 00-2 2v7.172a2 2 0 00.586 1.414l8.704 8.704a2.426 2.426 0 003.42 0l6.58-6.58a2.426 2.426 0 000-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </>
  ),
  article: (
    <>
      <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z" />
      <path d="M14 2v4a2 2 0 002 2h4M10 9H8M16 13H8M16 17H8" />
    </>
  ),
};

interface SearchIconProps {
  name: SearchIconName;
  className?: string;
}

export function SearchIcon({ name, className }: SearchIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}