import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { CtaBand } from "@/components/home/CtaBand";
import { Arrow } from "@/components/ui/Arrow";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { explore } from "@/content/explore";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getBlogPosts } from "@/lib/api";
import { TRIPS, site } from "@/lib/site";

const PATH = "/blog";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { blog } = await getDictionary(lang);
  return {
    title: blog.metaTitle,
    description: blog.description,
    alternates: {
      canonical: localePath(lang, PATH),
      languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, PATH)])), "x-default": PATH },
    },
  };
}

/** Every published article, newest first, with topic filters. */
export default async function BlogPage({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, posts] = await Promise.all([getDictionary(lang), getBlogPosts(lang)]);
  const { blog } = dict;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: blog.title,
    description: blog.description,
    url: `${site.url}${localePath(lang, PATH)}`,
    inLanguage: lang,
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${site.url}${localePath(lang, `${PATH}/${p.slug}`)}`,
      datePublished: p.published_at,
      ...(p.image ? { image: p.image.url } : {}),
    })),
  }).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section data-dark-hero className="relative isolate overflow-hidden bg-navy-deep pt-[4.25rem] text-white md:pt-20">
        <HeroBackdrop src={`${TRIPS}/im3-mint-tea-on-a-guesthouse-table-with-a-view-of-the-atlas-peak.jpg`} />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16">
          <p className="mono text-gold-light">{blog.eyebrow}</p>
          <h1 className="font-display mt-3 max-w-3xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.08]">{blog.title}</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/80 md:text-lg">{blog.lead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        {posts.length > 0 ? (
          <BlogIndex posts={posts} lang={lang} dict={blog} />
        ) : (
          <div className="max-w-2xl">
            <p className="text-lg leading-relaxed text-muted">{blog.empty}</p>
            <Link href={localePath(lang, "/toubkal-guide")} className="btn-gold mt-7">
              {explore[lang].guideLink}
              <Arrow />
            </Link>
          </div>
        )}
      </section>

      <CtaBand lang={lang} dict={dict.cta} message={dict.whatsapp.message} />
    </>
  );
}
