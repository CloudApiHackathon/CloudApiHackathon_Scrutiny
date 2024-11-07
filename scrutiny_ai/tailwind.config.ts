import { nextui } from "@nextui-org/theme";
import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
	],
	theme: {
		extend: {
			screens: {
				lg: "1000px",
			},
			backgroundImage: {
				"gradient-overlay":
					"linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.30015756302521013) 11%, rgba(0,0,0,0) 21%, rgba(0,0,0,0) 79%, rgba(0,0,0,0.30015756302521013) 89%, rgba(0,0,0,0.7035189075630253) 100%)",
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				"meet-black": "var(--meet-black)",
				"icon-blue": "var(--icon-blue)",
				"hover-primary": "#1a6dde",
				black: "#000000DE",
				gray: "#444746",
				"meet-gray": "#5f6368",
				"dark-gray": "#3c4043",
				"meet-dark-gray": "#2e3235",
				"border-gray": "#747775",
				"light-gray": "#f1f3f4",
				"hairline-gray": "#dadce0",
				"container-gray": "#2c2c2c",
				"meet-blue": "#0b57d0",
				"light-blue": "#659df6",
				"deep-blue": "#1b44c8",
				"icon-hover-blue": "#afcbfa",
				"meet-red": "#ea4335",
				"hover-red": "#eb5346",
				"meet-orange": "#fa7b17",
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground":
						"hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground":
						"hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
					"primary-foreground":
						"hsl(var(--sidebar-primary-foreground))",
					"accent-foreground":
						"hsl(var(--sidebar-accent-foreground))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			spacing: {
				"4.5": "1.125rem",
				"6.5": "1.625rem",
				"9.5": "2.375rem",
				"13": "3.25rem",
				"17": "4.25rem",
				"32.5": "8.125rem",
				"42": "10.5rem",
				"57.5": "14.375rem",
				"70": "17.5rem",
				"90": "22.5rem",
				"94": "23.5rem",
				"100": "25rem",
				"112": "28rem",
				"135": "33.75rem",
				"152": "38rem",
				"156": "39rem",
				"185": "46.25rem",
				"3/10": "30%",
			},
			lineHeight: {
				"4.5": "1.125rem",
				"13": "3.25rem",
			},
			fontFamily: {
				roboto: ["Roboto", "Arial", "sans-serif"],
				"sans-serif": ["sans-serif", "Arial"],
				"google-sans": ["Google Sans", "Roboto", "Arial", "sans-serif"],
				"product-sans": [
					"Product Sans",
					"Roboto",
					"Arial",
					"sans-serif",
				],
			},
			fontSize: {
				xl: ["1.125rem", "1.5rem"],
				"1x": ["1.375rem", "1.75rem"],
				"3xl": ["1.75rem", "2.25rem"],
				"5xl": ["2.812rem", "3.25rem"],
			},
			maxWidth: {
				sm: "22.625rem",
				xl: "38rem",
				"2xl": "39rem",
				"3xl": "47.75rem",
			},
			zIndex: {
				"1": "1",
				"2": "2",
				"3": "3",
			},
			padding: {
				full: "100%",
			},
			letterSpacing: {
				loose: "0.00625em",
				looser: "0.0107142857em",
				loosest: "0.0142857143em",
				wide: "0.0421em",
				wider: "0.06em",
			},
			translate: {
				"22.5": "5.625rem",
			},
			boxShadow: {
				shadow:
					"0 1px 2px 0 rgba(60,64,67,.3),0 1px 3px 1px rgba(60,64,67,.15)",
				dark:
					"0 1px 2px 0 rgba(0,0,0,.3),0 2px 6px 2px rgba(0,0,0,.15)",
			},
			transitionDuration: {
				"15": "15ms",
				"250": "250ms",
			},
			animation: {
				rotate: "rotate 2s linear infinite",
				dash: "dash 1.25s ease-in-out infinite",
				popup: "popup 0.5s ease-in-out",
				"fade-in": "0.5s ease-in fade-in 0s forwards",
				"delayed-fade-in":
					"delayed-fade-in 0.75s cubic-bezier(.4,0,.2,1)",
				"transition-overlay-fade-in":
					"transition-overlay-fade-in 0.5s linear both",
				countdown: "countdown 60s linear infinite forwards",
				slideOutLeft: 'slideOutLeft 0.5s ease-in-out forwards',
				slideInLeft: 'slideInLeft 0.5s ease-in-out forwards',
				slideInRight: 'slideInRight 0.5s ease-in-out forwards',
			},
			keyframes: {
				rotate: {
					"100%": {
						transform: "rotate(360deg)",
					},
				},
				dash: {
					"0%": {
						strokeDasharray: "1, 200",
						strokeDashoffset: "0",
					},
					"50%": {
						strokeDasharray: "89, 200",
						strokeDashoffset: "-35px",
					},
					"100%": {
						strokeDasharray: "89, 200",
						strokeDashoffset: "-124px",
					},
				},
				popup: {
					"0%": {
						transform: "translateY(0)",
					},
					"100%": {
						transform: "translateY(-90px)",
					},
				},
				"fade-in": {
					"0%": {
						opacity: "0",
					},
					"100%": {
						opacity: "1",
					},
				},
				"delayed-fade-in": {
					"0%": {
						opacity: "0",
					},
					"66%": {
						opacity: "0",
					},
					"100%": {
						opacity: "1",
					},
				},
				"transition-overlay-fade-in": {
					"0%": {
						opacity: "0",
					},
					"100%": {
						opacity: "0.9",
					},
				},
				countdown: {
					"0%": {
						strokeDashoffset: "0",
					},
					"100%": {
						strokeDashoffset: "113",
					},
				},
				slideOutLeft: {
					'0%': { transform: 'translateX(0)', opacity: '1' },
					'100%': { transform: 'translateX(-100%)', opacity: '0' },
				},
				slideInLeft: {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				slideInRight: {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				  },
			},
		},
	},
	plugins: [require("tailwindcss-animate"), nextui()],
};
export default config;
