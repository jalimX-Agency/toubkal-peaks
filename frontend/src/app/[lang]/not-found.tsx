import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-7xl flex-col items-start justify-center px-4 pb-20 pt-36 md:px-8 md:pt-40">
      <p className="eyebrow">404</p>
      <h1 className="heading mt-3 text-[clamp(2rem,5vw,3.4rem)]">Off the trail.</h1>
      <p className="mt-4 max-w-md text-lg text-muted">This page does not exist (yet). Head back to base camp.</p>
      <Link href="/" className="btn-gold mt-8">
        Home
      </Link>
    </section>
  );
}
