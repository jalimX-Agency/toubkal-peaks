import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80svh] max-w-[1400px] flex-col justify-center px-5 pb-16 pt-32 md:px-10">
      <p className="mono text-terracotta">404</p>
      <h1 className="display mt-4 text-[clamp(4rem,14vw,11rem)]">Off the trail.</h1>
      <p className="mt-6 max-w-md text-lg text-ink-soft">This page does not exist (yet). Head back to base camp.</p>
      <Link href="/" className="mono mt-10 w-fit rounded-full bg-ink px-6 py-3.5 text-paper transition-colors hover:bg-terracotta">
        Home
      </Link>
    </section>
  );
}
