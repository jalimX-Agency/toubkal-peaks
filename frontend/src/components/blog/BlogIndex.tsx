"use client";

import { useState } from "react";
import { BlogCard } from "@/components/blog/BlogCard";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { BlogCard as Card } from "@/lib/types";

/** The articles with topic filters; the newest (or the featured one) is shown large while no filter is on. */
export function BlogIndex({ posts, lang, dict }: { posts: Card[]; lang: Locale; dict: Dictionary["blog"] }) {
  const [topic, setTopic] = useState<string | null>(null);
  const topics = (Object.keys(dict.categories) as (keyof Dictionary["blog"]["categories"])[]).filter((key) => posts.some((p) => p.category === key));
  const shown = topic ? posts.filter((p) => p.category === topic) : posts;
  const lead = topic ? null : (posts.find((p) => p.is_featured) ?? posts[0]);
  const rest = shown.filter((p) => p !== lead);

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${active ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`;

  return (
    <>
      {topics.length > 1 && (
        <div role="group" aria-label={dict.all} className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={topic === null} onClick={() => setTopic(null)} className={chip(topic === null)}>{dict.all}</button>
          {topics.map((key) => (
            <button key={key} type="button" aria-pressed={topic === key} onClick={() => setTopic(key)} className={chip(topic === key)}>
              {dict.categories[key]}
            </button>
          ))}
        </div>
      )}
      {lead && (
        <div className="mt-8">
          <BlogCard post={lead} lang={lang} dict={dict} large />
        </div>
      )}
      {rest.length > 0 && (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <li key={p.id}>
              <BlogCard post={p} lang={lang} dict={dict} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
