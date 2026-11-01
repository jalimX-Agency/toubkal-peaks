import { activities } from "@/content/activities";
import { destinations } from "@/content/destinations";
import { getDictionary } from "@/i18n/get-dictionary";
import { HUBS } from "@/lib/hubs";
import { site } from "@/lib/site";

/** A plain-text map of the site for AI assistants (llms.txt): who we are, the main pages, the languages. */
export async function GET() {
  const en = await getDictionary("en");
  const url = (path: string) => `${site.url}${path}`;
  const lines = [
    `# ${site.name}`,
    "",
    `> ${en.meta.homeDescription}`,
    "",
    `${site.name} is a tour operator based in ${site.address.street}, ${site.address.region}, near Imlil at the foot of Mount Toubkal, and in Marrakech, Morocco. Trips are private and guided. The site is available in English, French, Spanish and German (addresses start with /fr, /es or /de).`,
    "",
    "## Main pages",
    `- [All trips](${url("/trips")}): every trek, Sahara trip, imperial cities tour and day trip`,
    `- [Mount Toubkal climbing guide](${url("/toubkal-guide")}): route, seasons, difficulty, guides, what to pack`,
    `- [Blog](${url("/blog")}): practical articles on Toubkal, the Atlas and the Sahara`,
    `- [Plan a trip](${url("/book")}): request a tailor-made programme and price`,
    `- [About us](${url("/about")}) and [Contact](${url("/contact")})`,
    "",
    "## Trip categories",
    ...HUBS.map((h) => `- [${en.hubs[h.key].title}](${url(`/${h.path}`)})`),
    "",
    "## Destinations",
    ...destinations.map((d) => `- [${d.text.en.name}](${url(`/destinations/${d.slug}`)})`),
    "",
    "## Activities",
    ...activities.map((a) => `- [${a.text.en.name}](${url(`/activities/${a.slug}`)})`),
    "",
    "## Contact",
    `- Email: ${site.email} (information), ${site.reservationsEmail} (reservations)`,
    `- Phone and WhatsApp: ${site.phones.join(", ")}`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
