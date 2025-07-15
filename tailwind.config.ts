import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-green-dark": "#283618",
        "brand-green-light": "#606C38",
        "brand-cream": "#FEFAE0",
        "brand-orange-light": "#DDA15E",
        "brand-orange-dark": "#BC6C25",
      },
    },
  },
  plugins: [],
};

export default config;
