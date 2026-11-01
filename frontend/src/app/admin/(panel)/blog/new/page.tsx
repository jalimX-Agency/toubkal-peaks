import type { Metadata } from "next";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { PageHeader } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin/api";

// Admin pages read the API for the signed-in member on every visit: no instant (prerendered) navigation.
export const instant = false;

export const metadata: Metadata = { title: "New article" };

export default async function NewBlogPostPage() {
  const { categories } = await adminApi<{ categories: string[] }>("/blog-posts");
  return (
    <>
      <PageHeader title="New article" back={{ href: "/admin/blog", label: "Blog" }} />
      <div className="p-4 md:p-8">
        <div className="rounded-lg border border-line bg-white p-4 md:p-6">
          <BlogEditor categories={categories} />
        </div>
      </div>
    </>
  );
}
