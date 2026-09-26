/** @type {import('tailwindcss').Config} */
export default {
  content: ["./frontend/index.html", "./frontend/src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A",
        gold: "#C9A24D"
      }
    },
  },
  plugins: [],
};

