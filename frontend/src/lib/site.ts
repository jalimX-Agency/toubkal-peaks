/** Facts about the business, taken from the client's current website. Single source for header, footer, schema. */
export const site = {
  name: "Toubkal Peaks Travel",
  shortName: "Toubkal Peaks",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "info@toubkal-peaks.com",
  whatsapp: "+212661283086",
  whatsappDisplay: "+212 661 283 086",
  phones: ["+212 661 283 086", "+212 670 414 623"],
  city: "Marrakech",
  country: "MA",
  riadUrl: "https://www.riad-berber-towers.com/en",
};

const CDN = "https://cdn.toubkal-peaks.com";

/** Photos uploaded to Cloudflare R2 (site/ prefix). Alt texts live in the dictionaries. */
export const photos = {
  village: { src: `${CDN}/site/aroumd-village.jpg`, width: 2000, height: 1333 },
  terrace: { src: `${CDN}/site/terrace-toubkal.jpg`, width: 1600, height: 1200 },
  mule: { src: `${CDN}/site/mule-trek.jpg`, width: 2000, height: 1125 },
  hikers: { src: `${CDN}/site/hikers-view.jpg`, width: 1400, height: 1050 },
  dunes: { src: `${CDN}/site/dunes-group.jpg`, width: 1600, height: 650 },
  souk: { src: `${CDN}/site/marrakech-souk.jpg`, width: 1600, height: 650 },
  camel: { src: `${CDN}/site/atlas-camel-ride.jpg`, width: 1600, height: 650 },
};

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp.replace("+", "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
