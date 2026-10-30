/** Facts about the business, taken from the client's current website. Single source for header, footer, schema. */
export const site = {
  name: "Toubkal Peaks Travel",
  shortName: "Toubkal Peaks",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "info@toubkal-peaks.com",
  whatsapp: "+212661283086",
  whatsappDisplay: "+212 661 283 086",
  phones: ["+212 661 283 086", "+212 670 414 623"],
  /** Office address, as given by the owner. */
  address: { street: "Dr Aremd, Commune Asni", region: "El Haouz", postalCode: "42150", city: "Marrakech" },
  city: "Marrakech",
  country: "MA",
  riadUrl: "https://www.riad-berber-towers.com/en",
  /** Moroccan company registration, as given by the owner. */
  registration: [
    { label: "RC", value: "52029" },
    { label: "P", value: "46417602" },
    { label: "IF", value: "40494420" },
    { label: "CNSS", value: "9119076" },
    { label: "ICE", value: "000114960000080" },
  ],
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

/** Brand files, hero footage and the contour texture, all on R2 (site/ prefix). */
export const media = {
  logo: { src: `${CDN}/site/brand/logo-horizontal.png`, width: 595, height: 128 },
  logoOnDark: { src: `${CDN}/site/brand/logo-horizontal-on-dark.png`, width: 595, height: 128 },
  ogImage: `${CDN}/site/brand/og-default.jpg`,
  icon: (size: 192 | 512) => `${CDN}/site/brand/icon-${size}.png`,
  iconMaskable: `${CDN}/site/brand/icon-maskable-512.png`,
  heroVideo: `${CDN}/site/video/hero-toubkal.mp4`,
  heroPoster: `${CDN}/site/video/hero-toubkal-poster.jpg`,
  topo: `${CDN}/site/textures/topo.svg`,
};

/** Free Pexels photos for what the client has no photos of yet (sources: media/pexels/sources.txt in the client folder). */
const STOCK = `${CDN}/site/stock`;
export const stock = {
  saharaDunes: { src: `${STOCK}/sahara-dunes.jpg`, width: 1800, height: 1200 },
  saharaCaravan: { src: `${STOCK}/sahara-caravan-dusk.jpg`, width: 1200, height: 1767 },
  saharaCamels: { src: `${STOCK}/sahara-camels-sunset.jpg`, width: 1200, height: 1800 },
  fesSkyline: { src: `${STOCK}/fes-skyline.jpg`, width: 1200, height: 1200 },
  fesTanneries: { src: `${STOCK}/fes-tanneries.jpg`, width: 1800, height: 1200 },
  koutoubia: { src: `${STOCK}/marrakech-koutoubia.jpg`, width: 1200, height: 1800 },
  medinaAlley: { src: `${STOCK}/marrakech-alley.jpg`, width: 1200, height: 1600 },
  atlasValley: { src: `${STOCK}/atlas-valley-peaks.jpg`, width: 1800, height: 1350 },
  atlasSnow: { src: `${STOCK}/atlas-snow-peaks.jpg`, width: 1800, height: 1200 },
  imlilValley: { src: `${STOCK}/imlil-valley.jpg`, width: 1200, height: 1600 },
  oukaimeden: { src: `${STOCK}/oukaimeden-snow.jpg`, width: 2000, height: 1333 },
  atlasFoothills: { src: `${STOCK}/atlas-foothills-village.jpg`, width: 1800, height: 1175 },
  aitBenhaddou: { src: `${STOCK}/ait-benhaddou-kasbah.jpg`, width: 1800, height: 1200 },
};

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp.replace("+", "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
