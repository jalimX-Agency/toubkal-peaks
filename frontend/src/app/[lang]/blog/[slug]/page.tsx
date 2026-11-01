import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard, blogDate, optimizable } from "@/components/blog/BlogCard";
import { CtaBand } from "@/components/home/CtaBand";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { hasLocale, localePath, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { getDictionary } from "@/i18n/get-dictionary";
import { getBlogPost, getBlogPosts } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import { site } from "@/lib/site";

// Articles render on their first request, then stay cached until Laravel refreshes the "blog" tag.
export const instant = false;

/** Built ahead in English only; the other languages render on demand. Never an empty list (Cache Components). */
export async function generateStaticParams() {
  const posts = await getBlogPosts("en");
  return posts.length > 0 ? posts.map((p) => ({ lang: "en", slug: p.slug })) : [{ lang: "en", slug: "none" }];
}

const path = (slug: string) => `/blog/${slug}`;

/** An article not yet translated shows the English text; search engines are pointed to the English page. */
function alternates(post: BlogPost, lang: Locale) {
  const written = locales.filter((l) => post.locales.includes(l));
  return {
    canonical: localePath(post.locales.includes(lang) ? lang : "en", path(post.slug)),
    languages: { ...Object.fromEntries(written.map((l) => [l, localePath(l, path(post.slug))])), "x-default": path(post.slug) },
  };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const post = await getBlogPost(slug, lang);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: alternates(post, lang),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      url: localePath(lang, path(post.slug)),
      publishedTime: post.published_at,
      modifiedTime: post.updated_at ?? undefined,
      ...(post.image ? { images: [post.image.url] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, post, all] = await Promise.all([getDictionary(lang), getBlogPost(slug, lang), getBlogPosts(lang)]);
  if (!post) notFound();
  const { blog } = dict;
  const more = [...all.filter((p) => p.slug !== post.slug && p.category === post.category && post.category), ...all.filter((p) => p.slug !== post.slug && (p.category !== post.category || !post.category))].slice(0, 3);
  const url = `${site.url}${localePath(lang, path(post.slug))}`;
  const category = post.category ? (blog.categories[post.category as keyof Dictionary["blog"]["categories"]] ?? null) : null;
  const edited = post.updated_at && post.updated_at.slice(0, 10) > post.published_at.slice(0, 10);

  const jsonLd = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt || undefined,
      url,
      mainEntityOfPage: url,
      inLanguage: post.locale,
      datePublished: post.published_at,
      dateModified: post.updated_at ?? post.published_at,
      ...(post.image ? { image: post.image.url } : {}),
      author: { "@type": "Organization", name: post.author, url: site.url },
      publisher: { "@type": "Organization", name: site.name, url: site.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: dict.trip.home, item: `${site.url}${localePath(lang, "/")}` },
        { "@type": "ListItem", position: 2, name: blog.nav, item: `${site.url}${localePath(lang, "/blog")}` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ]).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section data-dark-hero className="relative isolate overflow-hidden bg-navy-deep pt-[4.25rem] text-white md:pt-20">
        <HeroBackdrop />
        <div className="mx-auto max-w-3xl px-4 pb-12 pt-8 md:px-8 md:pb-14 md:pt-10">
          <nav aria-label="Breadcrumb" className="mono text-white/55">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href={localePath(lang, "/")} className="hover:text-white">{dict.trip.home}</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={localePath(lang, "/blog")} className="hover:text-white">{blog.nav}</Link></li>
            </ol>
          </nav>
          {category && <p className="mono mt-6 text-gold-light">{category}</p>}
          <h1 className="font-display mt-3 text-[clamp(2rem,4.2vw,3.2rem)] font-semibold leading-[1.1]" lang={post.locale}>{post.title}</h1>
          {post.excerpt && <p className="mt-5 leading-relaxed text-white/80 md:text-lg" lang={post.locale}>{post.excerpt}</p>}
          <p className="mono mt-6 text-[0.72rem] text-white/60">
            {post.author} · <time dateTime={post.published_at}>{blog.published.replace("{date}", blogDate(post.published_at, lang))}</time>
            {edited && <> · <time dateTime={post.updated_at!}>{blog.updated.replace("{date}", blogDate(post.updated_at!, lang))}</time></>}
            {" · "}{blog.readTime.replace("{n}", String(post.reading_minutes))}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        {post.image && (
          <div className="relative -mt-4 mb-10 aspect-[16/9] overflow-hidden rounded-sm bg-sand md:-mt-8">
            <Image src={post.image.url} alt={post.image.alt} fill priority unoptimized={!optimizable(post.image.url)} sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
        )}
        {post.locale !== lang && <p className="mb-8 rounded-sm border border-line bg-sand/60 px-4 py-3 text-sm text-muted">{blog.notTranslated}</p>}
        {/* HTML filtered by the API to the blog vocabulary (App\Support\BlogHtml), styled by blog-content.css */}
        <div className="blog-content" lang={post.locale} dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      {more.length > 0 && (
        <section className="bg-cream">
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="heading text-[clamp(1.6rem,3vw,2.4rem)]">{blog.more}</h2>
              <Link href={localePath(lang, "/blog")} className="text-sm font-semibold text-navy underline decoration-gold underline-offset-4 hover:text-gold">{blog.back}</Link>
            </div>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <li key={p.id}><BlogCard post={p} lang={lang} dict={blog} /></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand lang={lang} dict={dict.cta} message={dict.whatsapp.message} />
    </>
  );
}
