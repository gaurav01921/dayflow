import { Search, X } from "lucide-react"
import type { InputHTMLAttributes } from "react"
import { forwardRef } from "react"

import { cn } from "@/lib/utils"

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, value, onChange, onClear, placeholder = "Search...", ...props }, ref) => {
    const hasValue = value !== undefined && value !== ""

    return (
      <div className={cn("relative flex items-center w-full max-w-sm", className)}>
        <Search className="text-muted-foreground pointer-events-none absolute left-3 size-4 shrink-0 select-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="border-input placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 bg-background text-foreground h-9 w-full rounded-md border py-1.5 pr-8 pl-9 text-sm shadow-xs transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {hasValue && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground absolute right-2.5 flex size-4 items-center justify-center rounded-sm transition-colors"
            title="Clear search"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    )
  }
)

SearchBar.displayName = "SearchBar"
