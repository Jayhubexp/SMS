import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: "class", // Enable dark mode
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
			colors: {
				// Light mode colors (white + blue palette)
				// These replace the previous pastel accents so the light theme uses only
				// blue and white tones while dark theme remains unchanged.
				lamaSky: "#E6F0FF", // light blue
				lamaSkyLight: "#FFFFFF", // white
				lamaPurple: "#BFDBFE", // blue-200
				lamaPurpleLight: "#F8FBFF", // very pale blue / almost white
				lamaYellow: "#BFDBFE", // reuse blue-200 for consistency
				lamaYellowLight: "#FFFFFF", // white

				// Dark mode colors (example)
				dark: {
					bg: "#1a202c",
					bgSecondary: "#2d3748",
					text: "#e2e8f0",
					textSecondary: "#a0aec0",
					border: "#4a5568",
				},
			},
		},
	},
	plugins: [],
};
export default config;
