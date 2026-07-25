import type { MetadataRoute } from "next";
import { de } from "@/lib/i18n/de";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: de.app.name,
    short_name: de.app.name,
    description: de.app.tagline,
    lang: "de-CH",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f9",
    theme_color: "#051e28",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
