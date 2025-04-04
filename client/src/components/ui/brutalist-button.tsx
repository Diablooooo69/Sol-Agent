import * as React from "react"
import { cn } from "@/lib/utils"

export interface BrutalistButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "default" | "red" | "blue" | "green" | "yellow" | "purple"
}

const BrutalistButton = React.forwardRef<HTMLButtonElement, BrutalistButtonProps>(
  ({ className, color = "default", ...props }, ref) => {
    const colorClasses = {
      default: "bg-[#2A2A2A] text-white",
      red: "bg-brutalism-red text-white",
      blue: "bg-brutalism-blue text-white",
      green: "bg-brutalism-green text-white",
      yellow: "bg-brutalism-yellow text-black",
      purple: "bg-brutalism-purple text-white",
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          "brutalist-button px-4 py-2 rounded-button font-mono font-bold",
          colorClasses[color],
          className
        )}
        {...props}
      />
    )
  }
)
BrutalistButton.displayName = "BrutalistButton"

export { BrutalistButton }
