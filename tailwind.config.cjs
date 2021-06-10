let weights = Array.from(Array(9), (_, i) => (i + 1) * 100);
let fontWeight = {};
weights.forEach(val => {
  fontWeight[val] = val;
})

module.exports = {
  darkMode: 'class',
  mode: "jit",
  purge: [
    'src/**/*.pug'
  ],
  theme: {
    extend: {
      fontFamily: {
        "title": ["Frank Ruhl Libre", "serif"],
        "regular": ["Manrope", "Century Gothic", "sans-serif"],
        "bold": ["Montserrat", "Century Gothic", "Manrope", "sans-serif"],
      },
      fontWeight,
      colors: {
        "elevated": "#1C1C1E",
        "elevated-2": "#262628",
        "label": "#ddd",
        "secondary": "#bbb",
        "tertiary": "#555",
        "quaternary": "#333",
        "center-container-dark": "#121212",
        // "primary-dark": "#271daf",
        // "primary": "#2d22ca",
        // "primary-light": "#4e41ff",
        // "tertiary": "#ffde03",
        // "tertiary-dark": "#e5c702",
        // "light-mode": {
        //   "secondary-light": "#ff4b78",
        //   "secondary": "#ff3a6b",
        //   "secondary-dark": "#ce0c3c",
        //   "tertiary-light": "#ffe851",
        //   "off-blue": "#d7d4ff",
        //   "background": "#eaeef1",
        //   "surface": "#fff",
        //   "white": "#fff",
        //   "black": "#000",
        //   "very-light": "#efefef",
        //   "invert-white": "#fff",
        //   "light": "#eee",
        //   "mid-light": "#ddd",
        //   "mid": "#ccc",
        //   "mid-dark": "#bbb",
        //   "dark": "#222",
        // }
      },
      screens: {
        "3xl": "1633px",
        "1.5xl": "1333px",
        'lt-2xl': { 'max': '1535px' },
        // => @media (max-width: 1535px) { ... }

        'lt-xl': { 'max': '1279px' },
        // => @media (max-width: 1279px) { ... }

        'lt-lg': { 'max': '1023px' },
        // => @media (max-width: 1023px) { ... }

        'lt-md': { 'max': '767px' },
        // => @media (max-width: 767px) { ... }

        'lt-sm': { 'max': '639px' },
        // => @media (max-width: 639px) { ... }

        'lt-xsm': { 'max': '339px' },
        // => @media (max-width: 639px) { ... }
      },
      container: {
        center: 'true',
      },
    },
  },
  /* ... */
};
