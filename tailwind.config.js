/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,md,mdx}",
    "./plan/**/*.{md,mdx}",
    "./docs/**/*.{md,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    // Disable Tailwind's base/reset styles so they don't conflict with Infima (Docusaurus's CSS framework)
    preflight: false,
  },
};
