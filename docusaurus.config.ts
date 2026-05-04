import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Exploring a Future Without Action",
  tagline: "Louisiana's 2029 Coastal Master Plan (TEST)",
  favicon: "img/favicon.png",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://cpra-mp.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/mp23-digital-plan-testing/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "cpra-mp", // Usually your GitHub org/user name.
  projectName: "mp23-digital-plan-testing", // Usually your repo name.

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [
    async function tailwindPlugin() {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require("tailwindcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },
  ],

  presets: [
    [
      "classic",
      {
        blog: false,
        docs: {
          path: "plan",
          routeBasePath: "plan",
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/CPRA-MP/mp23-digital-plan-testing/tree/main",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    // image: "img/docusaurus-social-card.jpg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Exploring a Future Without Action",
      logo: {
        alt: "Coastal Protection and Restoration Authority of Louisiana",
        src: "img/logo.png",
      },
      items: [
        {
          href: "/#overview",
          label: "Overview",
          position: "left",
        },
        {
          href: "/plan/results/",
          label: "Model Results",
          position: "left",
        },
        {
          href: "/plan/technical-details/",
          label: "Technical Details",
          position: "left",
        },
        {
          href: "https://github.com/cpra-mp/mp23-digital-plan-testing",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Exploring a Future Without Action",
          items: [
            {
              label: "Overview",
              to: "/#overview",
            },
            {
              label: "Model Results",
              to: "/plan/results/",
            },
            {
              label: "Technical Details",
              to: "/plan/technical-details/",
            },
          ],
        },
        {
          title: "Learn More",
          items: [
            {
              label: "CPRA",
              href: "https://coastal.la.gov",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Coastal Protection and Restoration Authority`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
