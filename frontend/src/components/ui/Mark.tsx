/** The Toubkal Peaks mark: two peaks, the taller one snow-capped. Drawn here so it stays crisp at any size. */
export function Mark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 32" className={className} aria-hidden="true" fill="none">
      <path d="M1 31 15 7l9 14 4-6 11 16H1Z" fill="currentColor" />
      <path d="M15 7 11.3 13.2l2.2-1.1 1.6 2.3 1.5-2 2.2 1.2L15 7Z" fill="var(--paper)" />
    </svg>
  );
}
