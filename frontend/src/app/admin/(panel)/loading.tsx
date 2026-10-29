/** Shown at once while an admin page loads its data (every page reads the API live). */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="border-b border-line bg-white px-4 pb-4 pt-5 md:px-8 md:pt-8">
        <div className="h-8 w-48 animate-pulse rounded bg-sand" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-sand/70" />
      </div>
      <div className="space-y-3 p-4 md:p-8">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-white" />)}
      </div>
    </div>
  );
}
