/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Nordic Night" - A modern, eye-friendly dark theme.
        background: '#0F172A', // Deep Dark Blue (Slate 900)
        surface: '#1E293B',    // Dark Blue-Gray (Slate 800)
        primary: '#3B278C',    // Deep Koamaru / Persian Blue / Violent Violet for high contrast
        destructive: '#F43F5E',// Soft Red (Rose 500)
        success: '#14B8A6',    // Muted Green (Teal 500)
        subtle: '#334155',     // Muted Blue-Gray for borders (Slate 700)
        textprimary: '#CBD5E1',   // Soft White for primary text (Slate 300)
        textsecondary: '#64748B', // Muted Gray for secondary text (Slate 500)
      }
    },
  },
  plugins: [],
}

