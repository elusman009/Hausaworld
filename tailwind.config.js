module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        hausaworldBg: "#111111",
        hausaworldRed: "#e50914",
        hausaworldTeal: "#14b8a6"
      },
      borderRadius: {
        '2xl': '1rem'
      }
    }
  },
  plugins: []
}
