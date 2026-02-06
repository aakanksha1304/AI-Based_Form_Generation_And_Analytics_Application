/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			inter: [
  				'Inter',
  				'sans-serif'
  			],
  			base: ['Inter', 'sans-serif'],
  			heading: ['Inter', 'sans-serif']
  		},
  		fontWeight: {
  			base: '500',
  			heading: '700'
  		},
  		boxShadow: {
  			card: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  			'card-hover': '0 35px 60px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.15)',
  			shadow: 'var(--neo-shadow)',
  			nav: '4px 4px 0px 0px var(--neo-border)',
  			navDark: '4px 4px 0px 0px var(--neo-border)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			base: '5px'
  		},
  		spacing: {
  			boxShadowX: '4px',
  			boxShadowY: '4px',
  			reverseBoxShadowX: '-4px',
  			reverseBoxShadowY: '-4px'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// Neobrutalism colors
  			'neo-background': 'var(--neo-background)',
  			'neo-secondary-background': 'var(--neo-secondary-background)',
  			'neo-foreground': 'var(--neo-foreground)',
  			'neo-main': 'var(--neo-main)',
  			'neo-main-foreground': 'var(--neo-main-foreground)',
  			'neo-border': 'var(--neo-border)',
  			'neo-ring': 'var(--neo-ring)',
  			'neo-overlay': 'var(--neo-overlay)',
  			// Aliases for easier use
  			main: 'var(--neo-main)',
  			'main-foreground': 'var(--neo-main-foreground)',
  			'secondary-background': 'var(--neo-secondary-background)',
  			darkBorder: 'var(--neo-border)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}