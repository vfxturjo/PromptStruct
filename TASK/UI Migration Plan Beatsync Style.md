UI Style Migration Plan: From Project-Prompter to Beatsync
This document provides a precise, step-by-step guide for an automated agent to refactor the "Project-Prompter" application's UI to match the aesthetic and structure of the "Beatsync" project.
The migration is divided into five main phases:
Dependency & Configuration Alignment: Setting up the project with the necessary tools and configurations.
Global Styling & Theming: Replacing the existing CSS foundation with the new themeable structure.
Layout & Component Integration: Applying the new styles and theme provider to the application's core layout.
Verification & Final Touches: Adding a theme toggle to confirm and control the new UI.
Component Refactoring & Finalization: Systematically updating individual components and integrating fonts.
Phase 1: Dependency & Configuration Alignment
Objective: Ensure the project has the correct dependencies and configuration files for styling, theming, and path aliases.
Task 1.1: Install Dependencies
Execute the following command in the project's root directory to install required and missing UI-related packages.
```
bun add tailwind-merge tailwindcss-animate class-variance-authority clsx lucide-react @radix-ui/react-slot next-themes
```

Task 1.2: Update Tailwind CSS Configuration
Replace the entire content of tailwind.config.js with the code below. This configures the darkMode strategy and adds the tailwindcss-animate plugin.
```
/** @type {import('tailwindcss').Config} */
module.exports = {
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
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

Task 1.3: Update TypeScript Configuration for Aliases
Modify the tsconfig.json file. Add the "baseUrl" and "paths" properties inside the compilerOptions object to enable path aliases.
```
{
  "compilerOptions": {
    // ... existing options ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  // ... rest of the file ...
}
```

Phase 2: Global Styling & Theming
Objective: Overhaul the project's base CSS to implement the Beatsync color palette, theme variables, and custom animations.
Task 2.1: Replace Global Stylesheet
Delete the existing src/index.css file.
Create a new file named src/globals.css.
Populate src/globals.css with the exact content provided in the beatsync_styling_guide.md document under the "Full globals.css Content" section.
Crucial Context: For a detailed breakdown of the new color system, variables, and custom animations included in this file, refer to the beatsync_styling_guide.md document.
Task 2.2: Update Application Entry Point
Modify src/main.tsx to import src/globals.css instead of src/index.css.
```
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './globals.css' // Ensure this path is correct

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Phase 3: Layout & Component Integration
Objective: Implement a theme provider to control light/dark modes and apply the base theme styles to the main application layout.
Task 3.1: Create Theme Provider Component
Create a new file at src/components/theme-provider.tsx and add the following code.
// src/components/theme-provider.tsx
```
import { createContext, useContext, useEffect, useState } from "react"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}

type ThemeProviderState = {
  theme: string
  setTheme: (theme: string) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
      return
    }
    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: string) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
```

Task 3.2: Integrate Theme Provider into Application
Update src/main.tsx to wrap the App component with the ThemeProvider. Set the default theme to "dark".
// src/main.tsx

```
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './globals.css'
import { ThemeProvider } from './components/theme-provider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
```

Phase 4: Verification & Final Touches
Objective: Create a theme toggle component to verify that the theming system works and provide a user-facing control.
Task 4.1: Create Theme Toggle Component
Create a new file at src/components/ThemeToggle.tsx and add the code below.
```
// src/components/ThemeToggle.tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

Task 4.2: Add Theme Toggle to the Main Layout
Open src/components/MainLayout.tsx. Import the ThemeToggle and place it in the header.
// src/components/MainLayout.tsx
```
// ... other imports
import { ThemeToggle } from "./ThemeToggle"; // Import the new component

const MainLayout = () => {
  // ... existing code

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">Project Prompter</h1>
        <ThemeToggle />
      </header>

      {/* ... rest of your layout ... */}
    </div>
  );
};

export default MainLayout;
```

Phase 5: Component Refactoring & Finalization
Objective: Integrate the primary font and systematically update all UI components to use the new styling system for a consistent look and feel.
Task 5.1: Integrate Web Font
Modify index.html to include a link to the "Inter" Google Font in the <head> section.
```
<!-- index.html -->
<head>
  <!-- ... other head elements ... -->
  <link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)">
  <link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossorigin>
  <link href="[https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap)" rel="stylesheet">
</head>


Update tailwind.config.js to set "Inter" as the default sans-serif font.
// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... darkMode, content, prefix ...
  theme: {
    container: { /* ... */ },
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      keyframes: { /* ... */ },
      animation: { /* ... */ },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

Task 5.2: Systematically Refactor UI Components
Go through each component file and replace standard HTML elements with their corresponding shadcn/ui components.
src/components/MainLayout.tsx:
Ensure the main container div has bg-background and text-foreground.
Use <header> and <footer> with appropriate border classes like border-b or border-t.
src/components/ControlPanel.tsx:
Replace the main container with <Card>.
Use <CardHeader> with a <CardTitle> for the "Controls" heading.
Wrap the buttons in <CardContent>.
Convert all <button> elements to <Button> components. Use variant="secondary" or variant="outline" for actions like "New", "Save", "Load". Use variant="destructive" for "Clear".
src/components/PromptEditor.tsx:
Wrap the entire component in a <Card>.
Use a <CardHeader> for any titles or controls related to the editor.
Wrap the main editor area in <CardContent>.
Replace the <textarea> with the <Textarea> component from @/components/ui/textarea.
src/components/StructuralElementCard.tsx:
The root element should be a <Card>.
The header section with the title and buttons should be in a <CardHeader>.
The main content/description should be in <CardContent>.
Any footer actions should be in <CardFooter>.
Replace all buttons with the <Button> component, using size="sm" or size="icon" and variant="ghost" for icon-only buttons.
src/components/ProjectBrowser.tsx, ProjectSettings.tsx, ProjectTemplates.tsx, AdvancedSearch.tsx:
Apply the same <Card>-based structure.
Use <Input> for text fields, <Select> for dropdowns, and <Switch> for toggles.
Use <Label> for all form field labels to ensure proper styling and accessibility.
Task 5.3: Final Cleanup
After refactoring, search the entire codebase for any remaining custom CSS classes related to buttons, cards, inputs, etc., that are now redundant. Remove them to rely solely on the new utility-based system.
