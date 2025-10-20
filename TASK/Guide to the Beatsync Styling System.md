# **Guide to the Beatsync Styling System**

This document provides a comprehensive breakdown of the globals.css file from the Beatsync project. It is intended to guide an automated agent in understanding and applying the new design system during the UI migration of the "Project-Prompter" application.

### **1\. Core Concepts**

The styling system is built on two main concepts:

* **CSS Custom Properties (Variables):** The entire color scheme is managed by CSS variables (e.g., \--background, \--primary). This allows for easy theming and consistency.  
* **Dark Mode Strategy:** The system uses a class\-based dark mode. When the \<html\> element has the class .dark, a different set of color variables is applied.

### **2\. The Color System**

All colors are defined using semantic variable names. When refactoring components, use these variables via their corresponding Tailwind CSS utility classes (e.g., bg-background, text-primary, border-border).

#### **Primary Variables:**

| Variable | Tailwind Class | Description |
| :---- | :---- | :---- |
| \--background | bg-background | The main background color of the page. |
| \--foreground | text-foreground | The primary text color for the page. |
| \--card | bg-card | The background color for card components. |
| \--card-foreground | text-card-foreground | The text color used inside card components. |
| \--popover | bg-popover | The background for popovers and dropdowns. |
| \--popover-foreground | text-popover-foreground | The text color for popovers. |
| \--primary | bg-primary / text-primary | Main brand color for interactive elements (buttons, links). |
| \--primary-foreground | text-primary-foreground | Text color for elements with a bg-primary background. |
| \--secondary | bg-secondary / text-secondary | Color for less prominent interactive elements. |
| \--secondary-foreground | text-secondary-foreground | Text color for elements with a bg-secondary background. |
| \--muted | bg-muted / text-muted | For subtle backgrounds or de-emphasized text. |
| \--muted-foreground | text-muted-foreground | Text color for elements with a bg-muted background. |
| \--accent | bg-accent / text-accent | A subtle color for hover states or active items. |
| \--accent-foreground | text-accent-foreground | Text color for elements with a bg-accent background. |
| \--destructive | bg-destructive / text-destructive | Color for destructive actions (e.g., delete buttons). |
| \--destructive-foreground | text-destructive-foreground | Text color for elements with a bg-destructive background. |
| \--border | border-border | The primary border color for components. |
| \--input | border-input | The border color specifically for input fields. |
| \--ring | ring-ring | The color of focus rings on interactive elements. |

### **3\. Full globals.css Content**

This is the complete code that should be placed in src/globals.css as specified in **Task 2.1** of the migration plan.

```

@import "tailwindcss";

@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark \*));

@theme inline {  
  \--color-background: var(--background);  
  \--color-foreground: var(--foreground);  
  \--font-sans: var(--font-inter);  
  \--font-mono: var(--font-geist-mono);  
  \--color-sidebar-ring: var(--sidebar-ring);  
  \--color-sidebar-border: var(--sidebar-border);  
  \--color-sidebar-accent-foreground: var(--sidebar-accent-foreground);  
  \--color-sidebar-accent: var(--sidebar-accent);  
  \--color-sidebar-primary-foreground: var(--sidebar-primary-foreground);  
  \--color-sidebar-primary: var(--sidebar-primary);  
  \--color-sidebar-foreground: var(--sidebar-foreground);  
  \--color-sidebar: var(--sidebar);  
  \--color-chart-5: var(--chart-5);  
  \--color-chart-4: var(--chart-4);  
  \--color-chart-3: var(--chart-3);  
  \--color-chart-2: var(--chart-2);  
  \--color-chart-1: var(--chart-1);  
  \--color-ring: var(--ring);  
  \--color-input: var(--input);  
  \--color-border: var(--border);  
  \--color-destructive-foreground: var(--destructive-foreground);  
  \--color-destructive: var(--destructive);  
  \--color-accent-foreground: var(--accent-foreground);  
  \--color-accent: var(--accent);  
  \--color-muted-foreground: var(--muted-foreground);  
  \--color-muted: var(--muted);  
  \--color-secondary-foreground: var(--secondary-foreground);  
  \--color-secondary: var(--secondary);  
  \--color-primary-foreground: var(--primary-foreground);  
  \--color-primary: var(--primary);  
  \--color-popover-foreground: var(--popover-foreground);  
  \--color-popover: var(--popover);  
  \--color-card-foreground: var(--card-foreground);  
  \--color-card: var(--card);  
  \--radius-sm: calc(var(--radius) \- 4px);  
  \--radius-md: calc(var(--radius) \- 2px);  
  \--radius-lg: var(--radius);  
  \--radius-xl: calc(var(--radius) \+ 4px);  
}

:root {  
  \--background: oklch(1 0 0);  
  \--foreground: oklch(0.145 0 0);  
  \--card: oklch(1 0 0);  
  \--card-foreground: oklch(0.145 0 0);  
  \--popover: oklch(1 0 0);  
  \--popover-foreground: oklch(0.145 0 0);  
  \--primary: oklch(0.205 0 0);  
  \--primary-foreground: oklch(0.985 0 0);  
  \--secondary: oklch(0.97 0 0);  
  \--secondary-foreground: oklch(0.205 0 0);  
  \--muted: oklch(0.97 0 0);  
  \--muted-foreground: oklch(0.556 0 0);  
  \--accent: oklch(0.97 0 0);  
  \--accent-foreground: oklch(0.205 0 0);  
  \--destructive: oklch(0.577 0.245 27.325);  
  \--destructive-foreground: oklch(0.577 0.245 27.325);  
  \--border: oklch(0.922 0 0);  
  \--input: oklch(0.922 0 0);  
  \--ring: oklch(0.708 0 0);  
  \--radius: 0.625rem;  
}

.dark {  
  \--background: oklch(0.145 0 0);  
  \--foreground: oklch(0.985 0 0);  
  \--card: oklch(0.145 0 0);  
  \--card-foreground: oklch(0.985 0 0);  
  \--popover: oklch(0.145 0 0);  
  \--popover-foreground: oklch(0.985 0 0);  
  \--primary: oklch(0.985 0 0);  
  \--primary-foreground: oklch(0.205 0 0);  
  \--secondary: oklch(0.269 0 0);  
  \--secondary-foreground: oklch(0.985 0 0);  
  \--muted: oklch(0.269 0 0);  
  \--muted-foreground: oklch(0.708 0 0);  
  \--accent: oklch(0.269 0 0);  
  \--accent-foreground: oklch(0.985 0 0);  
  \--destructive: oklch(0.396 0.141 25.723);  
  \--destructive-foreground: oklch(0.637 0.237 25.331);  
  \--border: oklch(0.269 0 0);  
  \--input: oklch(0.269 0 0);  
  \--ring: oklch(0.439 0 0);  
}

@layer base {  
  \* {  
    @apply border-border outline-ring/50;  
  }  
  body {  
    @apply bg-background text-foreground;  
  }  
} 
```