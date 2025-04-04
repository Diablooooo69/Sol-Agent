import * as React from "react"
import { cn } from "@/lib/utils"

export interface BrutalistInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const BrutalistInput = React.forwardRef<HTMLInputElement, BrutalistInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "brutalist-input py-2 px-4 rounded-button w-full",
          className
        )}
        {...props}
      />
    )
  }
)
BrutalistInput.displayName = "BrutalistInput"

export { BrutalistInput }
