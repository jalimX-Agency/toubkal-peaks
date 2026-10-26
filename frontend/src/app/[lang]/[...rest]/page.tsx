import { notFound } from "next/navigation";

/**
 * Catch-all for pages that are not built yet (hubs, tours, contact...): they answer 404 inside the site layout.
 * Real routes replace this one page by page. (No generateStaticParams: with Cache Components an empty list is an
 * error, and without the export the route is simply rendered per request.)
 */
export default function NotYetBuilt() {
  notFound();
}
