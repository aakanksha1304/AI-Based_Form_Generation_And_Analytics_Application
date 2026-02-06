import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-base border-2 border-border bg-main px-4 py-2 text-base text-main-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-main-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }