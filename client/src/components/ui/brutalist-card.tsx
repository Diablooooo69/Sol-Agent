import * as React from "react"
import { cn } from "@/lib/utils"

export interface BrutalistCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const BrutalistCard = React.forwardRef<HTMLDivElement, BrutalistCardProps>(
  ({ className, hover = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "brutalist-card p-5",
          hover ? "" : "hover:transform-none hover:shadow-[8px_8px_0px_#000000]",
          className
        )}
        {...props}
      />
    )
  }
)
BrutalistCard.displayName = "BrutalistCard"

export { BrutalistCard }
