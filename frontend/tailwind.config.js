/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#1E3A8A', // Deep Blue
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563EB', // Bright Blue
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1E3A8A', // Deep Blue
                    950: '#172554',
                },
                accent: {
                    DEFAULT: '#14B8A6', // Teal
                }
            },
        },
    },
    plugins: [],
}
