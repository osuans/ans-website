/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffb3b3',
          300: '#ff8080',
          400: '#ff4d4d',
          500: '#BB0000', // Official OSU Scarlet
          600: '#A30000',
          700: '#8C0000',
          800: '#750000',
          900: '#5E0000',
          950: '#470000',
        },

        secondary: {
          50: '#f9f9f9', // near-white background
          100: '#f2f2f2',
          200: '#e6e6e6',
          300: '#cccccc',
          400: '#b3b3b3',
          500: '#A7A9AC', // official OSU light gray
          600: '#808080',
          700: '#666666', // official OSU gray
          800: '#4d4d4d',
          900: '#333333', // OSU off-black
          950: '#1a1a1a', // near-true black
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Source Sans Pro"', 'system-ui', 'sans-serif'],
        display: ['"Montserrat"', 'sans-serif'],
      },
    },
  },

  plugins: [
    require('@tailwindcss/typography'),
  ],
};