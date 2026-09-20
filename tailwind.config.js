/** @type {import('tailwindcss').Config} */
import o9Preset from "@o9/design-tokens/tailwind-preset";

export default {
  presets: [o9Preset],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
};
