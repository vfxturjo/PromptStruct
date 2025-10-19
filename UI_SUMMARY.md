# Project Prompter - UI Summary

## Overview
Project Prompter is a sophisticated prompt engineering application built with React, TypeScript, and Tailwind CSS. The application provides a comprehensive interface for managing projects, creating prompts, and organizing content with advanced features.

## Architecture

### Main Components
- **App.tsx**: Main application router with React Router
- **MainLayout.tsx**: Primary editor interface with drag-and-drop functionality
- **ProjectBrowser.tsx**: Project and prompt management interface

### Key Features

#### 1. Project Browser (`ProjectBrowser.tsx`)
- **Project Management**: Create, edit, delete, and export projects
- **Prompt Management**: Create, rename, duplicate, and delete prompts within projects
- **Search & Filter**: Basic search and advanced search functionality
- **Bulk Operations**: Select multiple prompts for batch operations
- **Templates**: Project templates for quick setup
- **Import/Export**: JSON-based project import/export

#### 2. Main Editor (`MainLayout.tsx`)
- **Drag & Drop**: Sortable structural elements using @dnd-kit
- **Three-Panel Layout**: Structure panel, preview panel, and help panel
- **Resizable Panels**: Using react-resizable-panels
- **Preview Modes**: Clean (processed) and Raw (with syntax) preview
- **Auto-save**: Automatic saving every 30 seconds
- **Keyboard Shortcuts**: Comprehensive keyboard shortcuts support

#### 3. Structural Elements (`StructuralElementCard.tsx`)
- **Editable Cards**: Individual prompt elements with name and content
- **Control Syntax**: Support for dynamic controls (text, select, slider, toggle)
- **Enable/Disable**: Toggle individual elements on/off
- **Drag Handle**: Visual drag handle for reordering

## UI Components

### Current Component Library
The project currently uses a mix of:
- **Radix UI**: @radix-ui/react-label, @radix-ui/react-select, @radix-ui/react-separator, @radix-ui/react-slot, @radix-ui/react-switch, @radix-ui/react-toggle
- **Custom Components**: Built on top of Radix primitives
- **Tailwind CSS**: For styling and layout

### Component Structure
```
src/components/ui/
├── badge.tsx          # Status badges and tags
├── button.tsx         # Button component with variants
├── card.tsx           # Card container components
├── input.tsx          # Text input fields
├── label.tsx          # Form labels
├── select.tsx         # Dropdown select components
├── separator.tsx      # Visual separators
├── sonner.tsx         # Toast notifications
├── switch.tsx         # Toggle switches
├── textarea.tsx       # Multi-line text input
└── toggle.tsx         # Toggle buttons
```

## Design System

### Color Scheme
- **Primary**: Blue gradient theme
- **Background**: Light/dark mode support
- **Cards**: Semi-transparent with backdrop blur
- **States**: Hover, active, disabled states

### Layout Patterns
- **Full-screen**: Application takes full viewport
- **Panel-based**: Resizable panels for different views
- **Card-based**: Content organized in cards
- **Modal dialogs**: For forms and settings

### Typography
- **Headings**: Bold, gradient text for main titles
- **Body**: Clean, readable fonts
- **Monospace**: For code and prompt content
- **Icons**: Lucide React icon library

## Interactive Features

### Drag & Drop
- **@dnd-kit/core**: Core drag and drop functionality
- **@dnd-kit/sortable**: Sortable list implementation
- **Visual feedback**: Opacity changes during drag

### Keyboard Shortcuts
- **Ctrl+N**: New element/prompt
- **Ctrl+S**: Save
- **Ctrl+C**: Copy prompt
- **Escape**: Navigate back
- **Custom shortcuts**: Context-aware shortcuts

### Notifications
- **Sonner**: Toast notification system
- **Success/Error**: Different notification types
- **Auto-dismiss**: Timed notifications

## State Management

### Zustand Store (`editorStore.ts`)
- **Projects**: Project management
- **Prompts**: Prompt management
- **Structure**: Structural elements
- **Settings**: Application settings
- **Current State**: Active project/prompt tracking

## Technical Stack

### Dependencies
- **React 18**: Core framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Zustand**: State management
- **@dnd-kit**: Drag and drop
- **react-resizable-panels**: Panel resizing
- **Lucide React**: Icons
- **Sonner**: Notifications

### Development Tools
- **Vite**: Build tool
- **Vitest**: Testing framework
- **ESLint**: Code linting
- **TypeScript**: Type checking

## Current Issues & Migration Needs

### Radix UI Dependencies
The project currently relies heavily on Radix UI components:
- @radix-ui/react-label
- @radix-ui/react-select  
- @radix-ui/react-separator
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-toggle

### Migration Goals
1. **Remove all Radix UI dependencies**
2. **Migrate to shadcn/ui components**
3. **Use pre-made shadcn components where possible**
4. **Maintain existing functionality**
5. **Improve component consistency**

## File Structure
```
src/
├── components/
│   ├── MainLayout.tsx
│   ├── ProjectBrowser.tsx
│   ├── StructuralElementCard.tsx
│   ├── ControlPanel.tsx
│   ├── AdvancedSearch.tsx
│   ├── ProjectSettings.tsx
│   ├── ProjectTemplates.tsx
│   ├── PromptEditor.tsx
│   └── ui/                    # UI component library
├── stores/
│   └── editorStore.ts         # Zustand store
├── services/
│   ├── keyboardShortcuts.ts
│   └── notificationService.ts
├── utils/
│   └── syntaxParser.ts
├── types/
│   └── index.ts
└── App.tsx
```

This summary provides a comprehensive overview of the current UI structure and will serve as a reference during the migration to shadcn/ui components.
