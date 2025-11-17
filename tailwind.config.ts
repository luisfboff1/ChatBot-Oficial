import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        mint: {
          500: "#1ABC9C",
          400: "#33c6ac",
          300: "#57d4ba",
        },
        azure: {
          500: "#2E86AB",
          400: "#3f97bd",
          300: "#5eb0d2",
        },
        ink: {
          900: "#031414",
          800: "#051b1d",
          700: "#0a2428",
        },
        silver: {
          200: "#B0B8BD",
          100: "#DDE5EA",
        },
        gold: {
          400: "#FFD700",
          300: "#FFE166",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          soft: "hsl(var(--surface-soft))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        glow: "0 12px 40px rgba(26, 188, 156, 0.18)",
        "glow-blue": "0 16px 48px rgba(46, 134, 171, 0.22)",
      },
      backgroundImage: {
        "gradient-mint": "linear-gradient(135deg, #1ABC9C, #031414)",
        "gradient-blue": "linear-gradient(140deg, #2E86AB, #0B1C21)",
        "gradient-premium": "linear-gradient(135deg, #FFD700, rgba(3,20,20,0.85))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
