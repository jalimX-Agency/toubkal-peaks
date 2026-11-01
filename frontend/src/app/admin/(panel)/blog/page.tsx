import type { Metadata } from "next";
import Link from "next/link";
import { Empty, PageHeader, day } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin/api";
import type { AdminBlogPost } from "@/lib/admin/types";

// Admin pages read the API for the signed-in member on every visit: no instant (prerendered) navigation.
export const instant = false;

export const metadata: Metadata = { title: "Blog" };

const LOCALES = ["en", "fr", "es", "de"] as const;

export default async function BlogAdminPage() {
  const { data: posts } = await adminApi<{ data: AdminBlogPost[] }>("/blog-posts");

  return (
    <>
      <PageHeader title="Blog" subtitle="Articles in every language. Drafts are not on the website."
        actions={<Link href="/admin/blog/new" className="rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white">+ New article</Link>} />
      <div className="space-y-3 p-4 md:p-8">
        {posts.length === 0 ? <Empty>No articles yet.</Empty> : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-white">
            {posts.map((p) => {
              const live = p.published_at && new Date(p.published_at) <= new Date();
              return (
                <li key={p.id}>
                  <Link href={`/admin/blog/${p.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-cream">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-navy">{p.title.en}</span>
                      <span className="mono text-[0.7rem] text-muted">
                        /blog/{p.slug} · {LOCALES.map((l) => (p.locales.includes(l) ? l.toUpperCase() : `${l.toUpperCase()}–`)).join(" ")}
                      </span>
                    </span>
                    {p.is_featured && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-white">Featured</span>}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${live ? "bg-atlas/10 text-atlas" : p.published_at ? "bg-imperial/10 text-imperial" : "bg-muted/15 text-muted"}`}>
                      {live ? `Published ${day(p.published_at)}` : p.published_at ? `Scheduled ${day(p.published_at)}` : "Draft"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-xs text-muted">EN FR ES DE: languages the article is written in; a dash means the English text is shown in that language.</p>
      </div>
    </>
  );
}
