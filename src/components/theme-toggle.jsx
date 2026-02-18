"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch — only render after mount
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-full"
        aria-label="Toggle theme"
      >
        <span className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative h-9 w-9 rounded-full transition-all duration-300
        ${isDark
          ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400'
          : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500'}
      `}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {/* Sun — visible in light mode */}
      <Sun
        className={`
          h-[1.1rem] w-[1.1rem] absolute transition-all duration-500
          ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
        `}
      />
      {/* Moon — visible in dark mode */}
      <Moon
        className={`
          h-[1.1rem] w-[1.1rem] absolute transition-all duration-500
          ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
        `}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}