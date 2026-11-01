import Image from "next/image";
import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { BlogCard as Card } from "@/lib/types";

/** Covers on the site's CDN go through the image optimizer; any other https host is shown as it is. */
export const optimizable = (url: string) => url.startsWith("https://cdn.toubkal-peaks.com/");

export const blogDate = (iso: string, lang: Locale) => new Intl.DateTimeFormat(lang, { dateStyle: "long" }).format(new Date(iso));

export function BlogCard({ post, lang, dict, large = false }: { post: Card; lang: Locale; dict: Dictionary["blog"]; large?: boolean }) {
  return (
    <Link href={localePath(lang, `/blog/${post.slug}`)} className="group flex h-full flex-col overflow-hidden rounded-sm border border-line bg-white transition-shadow hover:shadow-lg">
      <div className={`relative overflow-hidden bg-sand ${large ? "aspect-[16/9]" : "aspect-[3/2]"}`}>
        {post.image && (
          <Image
            src={post.image.url}
            alt={post.image.alt}
            fill
            unoptimized={!optimizable(post.image.url)}
            sizes={large ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {post.category && (
          <span className="mono absolute left-3 top-3 rounded-sm bg-navy-deep/80 px-2.5 py-1 text-gold-light">{dict.categories[post.category as keyof Dictionary["blog"]["categories"]] ?? post.category}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className={`font-display font-semibold leading-snug text-navy group-hover:text-gold ${large ? "text-[clamp(1.4rem,2.4vw,1.9rem)]" : "text-xl"}`} lang={post.locale}>
          {post.title}
        </h3>
        {post.excerpt && <p className={`mt-3 leading-relaxed text-muted ${large ? "" : "line-clamp-3 text-sm"}`} lang={post.locale}>{post.excerpt}</p>}
        <p className="mono mt-auto pt-5 text-[0.72rem] text-muted">
          <time dateTime={post.published_at}>{blogDate(post.published_at, lang)}</time> · {dict.readTime.replace("{n}", String(post.reading_minutes))}
        </p>
      </div>
    </Link>
  );
}
