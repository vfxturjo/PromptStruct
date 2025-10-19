# Project Gemini - The Intelligent Prompt Engineer

A sophisticated, client-side web application designed to streamline the creation, management, and sharing of structured prompts for Large Language Models (LLMs).

## 🚀 Features Implemented

### ✅ Phase 1: Core Editor Functionality
- **Modern Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Basic UI Layout**: Three-panel layout with Structure, Editor, and Preview panels
- **CodeMirror Integration**: Custom text editor with syntax highlighting
- **Control Syntax Parser**: Parses `{{...}}` control syntax for dynamic prompts
- **State Management**: Zustand store for managing editor state
- **Responsive Design**: Clean, modern UI with shadcn/ui components

### 🎯 Control Types Supported
- `{{text:Name:Default}}` - Text input controls
- `{{toggle:Name}}...{{/toggle:Name}}` - Conditional content blocks
- `{{slider:Name:50}}` - Numeric slider controls (0-100)
- `{{select:Name:Option A|Option B|Option C}}` - Dropdown selectors

### 🏗️ Architecture
- **Frontend**: React SPA with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State**: Zustand for lightweight state management
- **Editor**: CodeMirror 6 with custom syntax highlighting
- **Build**: Vite for fast development and building
- **Storage**: LocalStorage for client-side persistence

## 🛠️ Development

### Prerequisites
- Node.js 18+ (or use nvm for latest version)
- Bun package manager

### Getting Started
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── MainLayout.tsx  # Main application layout
│   └── PromptEditor.tsx # CodeMirror-based editor
├── stores/             # Zustand state stores
│   └── editorStore.ts  # Main editor state
├── types/              # TypeScript type definitions
│   └── index.ts        # Core data models
├── utils/              # Utility functions
│   └── syntaxParser.ts # Control syntax parser
└── lib/                # Library utilities
    └── utils.ts        # shadcn/ui utilities
```

## 📋 Next Steps (Phase 2)

- [ ] Implement drag-and-drop for structural elements
- [ ] Add/remove/toggle structural elements functionality
- [ ] Generate UI controls from parsed syntax
- [ ] Real-time preview updates
- [ ] Project browser and data persistence
- [ ] Import/export functionality

## 🎨 UI Preview

The application features a clean, three-panel layout:
- **Left Panel**: Structure management (drag-and-drop elements)
- **Center Panel**: CodeMirror-based prompt editor
- **Right Panel**: Live preview of rendered prompt

## 🔧 Technical Details

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: Zustand
- **Code Editor**: CodeMirror 6
- **Drag & Drop**: dnd-kit (ready for implementation)
- **Routing**: React Router (ready for implementation)

Built with ❤️ for the AI community.
