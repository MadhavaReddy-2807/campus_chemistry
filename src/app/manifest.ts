import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Campus Chemistry",
    short_name: "Campus Chemistry",
    description: "Verified campus connections for IIT and NIT students.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f6f2",
    theme_color: "#6e2d3a",
    orientation: "portrait-primary",
    icons: [{ src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }],
  };
}
