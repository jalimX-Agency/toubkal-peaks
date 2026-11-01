import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCoverForm, BlogEditor, DeleteBlogPost } from "@/components/admin/BlogEditor";
import { PageHeader } from "@/components/admin/ui";
import { AdminApiError, adminApi } from "@/lib/admin/api";
import type { AdminBlogPost } from "@/lib/admin/types";

// Admin pages read the API for the signed-in member on every visit: no instant (prerendered) navigation.
export const instant = false;

export const metadata: Metadata = { title: "Edit article" };

export default async function EditBlogPostPage({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
  const { id } = await params;
  const { created } = await searchParams;
  let res: { data: AdminBlogPost; categories: string[] };
  try {
    res = await adminApi<{ data: AdminBlogPost; categories: string[] }>(`/blog-posts/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) notFound();
    throw error;
  }
  const post = res.data;
  const live = post.published_at && new Date(post.published_at) <= new Date();

  return (
    <>
      <PageHeader title={post.title.en ?? post.slug} back={{ href: "/admin/blog", label: "Blog" }}
        subtitle={live ? "Published on the website." : post.published_at ? "Scheduled: not on the website yet." : "Draft: not on the website."}
        actions={live ? <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gold hover:underline">View on the website ↗</a> : undefined} />
      <div className="space-y-4 p-4 md:p-8">
        {created && <p className="rounded-md bg-atlas/10 px-4 py-3 text-sm font-semibold text-atlas">Article created. Add a cover photo, the other languages, then publish.</p>}
        <div className="rounded-lg border border-line bg-white p-4 md:p-6">
          <BlogCoverForm post={post} />
        </div>
        <div className="rounded-lg border border-line bg-white p-4 md:p-6">
          <BlogEditor key={post.updated_at ?? post.id} post={post} categories={res.categories} />
        </div>
        <DeleteBlogPost post={post} />
      </div>
    </>
  );
}
