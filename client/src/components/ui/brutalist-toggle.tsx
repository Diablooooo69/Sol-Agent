import * as React from "react"
import { cn } from "@/lib/utils"

export interface BrutalistToggleProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const BrutalistToggle = React.forwardRef<HTMLInputElement, BrutalistToggleProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className={cn("relative inline-block w-[60px] h-[34px]", className)}>
        <input 
          ref={ref}
          type="checkbox"
          className="opacity-0 w-0 h-0"
          {...props}
        />
        <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#2A2A2A] border-3 border-black transition-[.4s] before:absolute before:content-[''] before:h-[22px] before:w-[22px] before:left-[2px] before:bottom-[2px] before:bg-white before:border-2 before:border-black before:transition-[.4s] checked:bg-brutalism-blue checked:before:translate-x-[26px]" />
        {label && <span className="ml-[70px]">{label}</span>}
      </div>
    )
  }
)
BrutalistToggle.displayName = "BrutalistToggle"

export { BrutalistToggle }
