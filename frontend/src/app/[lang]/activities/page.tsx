import { notFound, permanentRedirect } from "next/navigation";
import { hasLocale, localePath } from "@/i18n/config";

/** The activities are listed on the destinations page. */
export default async function ActivitiesPage({ params }: PageProps<"/[lang]/activities">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  permanentRedirect(`${localePath(lang, "/destinations")}#activities`);
}
