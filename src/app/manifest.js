export default function manifest() {
  return {
    id: "/",
    name: "RESET",
    short_name: "RESET",
    description: "RESET - habit tracker dan personal productivity.",
    start_url: "/",
    scope: "/",
    lang: "id",
    dir: "ltr",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#F5F8F6",
    theme_color: "#23845B",
    orientation: "portrait-primary",
    prefer_related_applications: false,
    categories: ["productivity", "lifestyle", "health"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}