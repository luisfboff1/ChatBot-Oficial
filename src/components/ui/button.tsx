import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Variantes de botão atualizadas para refletir a identidade UzzApp.
 * Mantemos base do shadcn/ui e acrescentamos estilos glow/outlines.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors transition-shadow transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-glow hover:-translate-y-[2px] hover:bg-primary/95 hover:shadow-glow",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "text-foreground hover:bg-surface-soft/60 hover:text-foreground transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
        glow:
          "bg-gradient-mint text-primary-foreground shadow-glow hover:-translate-y-[2px] hover:shadow-glow-blue",
        outlineMint:
          "border border-mint-500/60 text-mint-300 hover:border-mint-200 hover:text-mint-100 hover:bg-mint-500/10",
        premium:
          "bg-gradient-premium text-ink-900 shadow-glow hover:-translate-y-[2px] hover:shadow-glow",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
