import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Toubkal Peaks Travel",
    short_name: "Toubkal Peaks",
    description: "Treks, Sahara desert trips and private tours in Morocco.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f3",
    theme_color: "#022e55",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
