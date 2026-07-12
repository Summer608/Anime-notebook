/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
    },
    extend: {
      colors: {
        paper: "#FDF8F3",
        ink: "#2E2658",
        coral: "#FF6B6B",
        mint: "#4ECDC4",
        sunshine: "#FFE66D",
        mist: "#E8E4F0",
        stone: "#8A8798",
      },
      fontFamily: {
        display: ["SimSun", "宋体", "Songti SC", "STSong", "serif"],
        body: ["SimSun", "宋体", "Songti SC", "STSong", "serif"],
      },
      boxShadow: {
        soft: "0 8px 32px rgba(46, 38, 88, 0.08)",
        lift: "0 12px 40px rgba(46, 38, 88, 0.14)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "slide-in": "slideIn 0.4s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(-12px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
