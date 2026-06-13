"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Patch console.error to silence the "Encountered a script tag" warning from next-themes in React 19
// This is a known false positive as the script is intended for SSR but React 19 flags it on the client.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return
    }
    originalError.apply(console, args)
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
