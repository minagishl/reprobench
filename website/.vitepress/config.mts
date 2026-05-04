import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Reprobench",
  description: "Reproducible benchmark runner powered by Nix flakes.",

  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/result-format" },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Commands", link: "/guide/commands" },
          { text: "Configuration", link: "/guide/configuration" },
          { text: "Nix Integration", link: "/guide/nix" },
          { text: "CI Usage", link: "/guide/ci" },
        ],
      },
      {
        text: "Reference",
        items: [{ text: "Benchmark Result Format", link: "/reference/result-format" }],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/minagishl/reprobench" }],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 minagishl",
    },
  },
});
