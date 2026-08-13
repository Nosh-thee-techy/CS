/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#000000",
        charcoal: "#121212",
        panel: "#1C1C1E",
        mute: "#A0A0A0",
        ember: {
          DEFAULT: "#FF5C2A",
          deep: "#E23A1A",
          glow: "#FF7A3D",
        },
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 12px 40px -8px rgba(255, 92, 42, 0.55)",
        card: "0 18px 40px -24px rgba(0, 0, 0, 0.8)",
      },
      backgroundImage: {
        ember: "linear-gradient(90deg, #C2410C 0%, #EA580C 45%, #FB923C 100%)",
      },
    },
  },
  plugins: [],
};
