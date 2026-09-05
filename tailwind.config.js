/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        // Sampled from epos.bihar.gov.in
        epos: {
          brown: "#6b4226",      // top nav bar + footer
          brownDark: "#5a3720",
          maroon: "#7a1b2d",     // header sub-headings
          maroonBtn: "#7d1935",  // "Month Abstract" button
          panel: "#f3f3f3",
        },
      },
      fontFamily: {
        sans: ["Open Sans", "Roboto", "ui-sans-serif", "system-ui", "sans-serif"],
        digital: ["digital", "monospace"],
      },
    },
  },
  plugins: [],
};
