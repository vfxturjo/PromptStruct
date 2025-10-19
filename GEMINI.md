# Project Gemini: The Intelligent Prompt Engineer

## 1. Overview

Project Gemini is a sophisticated, client-side web application designed to streamline the creation, management, and sharing of structured prompts for Large Language Models (LLMs). It empowers users to move beyond simple text prompts and build complex, reusable, and dynamic prompt templates.

The application will be a Single Page Application (SPA) built with a modern technology stack, ensuring a fast, responsive, and intuitive user experience. A primary design goal is for the application to be easily deployable on static hosting services like GitHub Pages.

## 2. Core Features

### 2.1. The Element System: Dynamic & Composable Prompts

The foundation of Gemini is the "Element" system. Elements are snippets of text that contain dynamic controls, allowing for on-the-fly modification of the final prompt.

-   **Syntax:** Controls are defined using a simple, human-readable syntax: `{{type:Control_Name:Default_Value}}`. For encapsulating blocks of text, a closing tag is used: `{{type:Control_Name}}...{{/type:Control_Name}}`.
-   **Control Types:**
    -   `{{text:Name:Default}}`: A simple text input.
    -   `{{toggle:Name}}...{{/toggle:Name}}`: Includes the encapsulated text only if the toggle is on.
    -   `{{slider:Name:50}}`: A slider control (0-100) to insert a numeric value.
    -   `{{select:Name:Option A|Option B|Option C}}`: A dropdown selector.
-   **Nesting:** Controls can be nested to create complex conditional logic (e.g., a `toggle` containing a `slider`).
-   **UI Integration:** The application will parse this syntax and automatically generate a user-friendly set of controls in the editor UI for each structural element. The dynamic parts will be highlighted in the text editor for clarity.

### 2.2. Structure Maker & Editor

This is the main workspace where users build and interact with their prompts.

-   **Structural Elements:** Users can define high-level blocks for their prompt (e.g., "Persona," "Rules," "Task," "Output Format"). These act as containers for the prompt text and its dynamic Elements.
-   **Drag-and-Drop Interface:** Users can freely reorder the structural elements using a smooth drag-and-drop interface.
-   **Toggle On/Off:** Each structural element can be enabled or disabled with a single click, allowing for quick inclusion or exclusion from the final prompt.
-   **Control Panel:** Below each structural element's text editor, a dedicated panel will display all the interactive controls (`sliders`, `toggles`, `text inputs`, etc.) that were defined within its text content.

### 2.3. Live Preview Window

A real-time preview of the final prompt output.

-   **Clean Output Mode:** By default, it shows the fully rendered prompt, with all control placeholders replaced by their current values. This is the text ready to be copied and used.
-   **Raw Mode:** A toggle will allow users to see the prompt with the `{{...}}` syntax still visible, useful for debugging the prompt's structure.
-   **Copy Functionality:** A one-click "Copy to Clipboard" button.

### 2.4. Project Browser

A comprehensive system for saving, organizing, and retrieving work.

-   **Hierarchy:** The browser will use a three-level hierarchy: **Projects > Prompts > Versions**.
    -   **Projects:** Act as folders to group related prompts.
    -   **Prompts:** The main saved entity, containing the structure, element content, and default settings.
    -   **Versions:** Automatic and manual versioning for each prompt. Users can view, revert to, or create new prompts from previous versions.
-   **Storage:** All data will be stored in the browser's `LocalStorage`, making the application entirely client-side.
-   **Tagging System:** Users can add tags to projects and prompts for easy filtering and searching.

### 2.5. Data Management

-   **JSON-Based:** The entire state of a project or a prompt (including all its versions) will be serializable to JSON.
-   **Import/Export:** Users can easily export their work to a `.json` file for backup or sharing, and import `.json` files from others.

### 2.6. UI/UX and Error Handling

-   **Modern & Clean UI:** The interface will be designed to be intuitive and visually appealing, with a focus on minimizing clutter.
-   **In-UI Error Notifications:** Any logical or runtime errors (e.g., malformed JSON on import, syntax errors in control syntax) will be displayed as non-intrusive, dismissible "toast" notifications.

## 3. Technology Stack

This stack has been chosen for its modern architecture, performance, and excellent developer experience.

-   **Framework:** **React (v18+)** with **Vite** as the build tool.
-   **UI Components:** **shadcn/ui**, a collection of beautifully designed, accessible, and customizable components built on Radix UI and Tailwind CSS.
-   **Styling:** **Tailwind CSS** for a utility-first CSS workflow.
-   **Drag and Drop:** **dnd-kit** for a modern, performant, and accessible drag-and-drop experience.
-   **Code Editor:** **CodeMirror 6** (via `@uiw/react-codemirror`) for the text editing fields. It's highly customizable and will be configured with custom syntax highlighting for the `{{...}}` control syntax.
-   **State Management:** **Zustand**, a small, fast, and scalable state-management solution.
-   **Routing:** **React Router** for managing different views within the SPA.
-   **Persistence:** The browser's **LocalStorage API**.

## 4. Data Models (JSON Structure)

### Project

```json
{
  "id": "proj_123",
  "name": "Creative Writing Assistants",
  "prompts": ["prompt_abc", "prompt_def"],
  "tags": ["writing", "creative"],
  "createdAt": "2025-10-19T10:00:00Z"
}
```

### Prompt

```json
{
  "id": "prompt_abc",
  "name": "Fantasy Character Generator",
  "versions": ["ver_001", "ver_002"],
  "currentVersion": "ver_002",
  "tags": ["fantasy", "character"],
  "createdAt": "2025-10-19T10:05:00Z"
}
```

### Version

```json
{
  "id": "ver_002",
  "promptId": "prompt_abc",
  "createdAt": "2025-10-19T10:15:00Z",
  "structure": [
    {
      "id": "struct_01",
      "name": "Persona",
      "enabled": true,
      "content": "You are a master storyteller. Your task is to create a compelling character based on the following traits."
    },
    {
      "id": "struct_02",
      "name": "Core Traits",
      "enabled": true,
      "content": "The character is a {{select:Class:Warrior|Mage|Rogue}} of the {{text:Race:Elven}} race. They are known for their {{text:Key_Virtue:Bravery}}."
    },
    {
      "id": "struct_03",
      "name": "Extra Details",
      "enabled": false,
      "content": "{{toggle:Add_Secret}}They harbor a dark secret: they are secretly afraid of {{text:Secret_Fear:spiders}}.{{/toggle:Add_Secret}}"
    }
  ]
}
```

## 5. Development Roadmap

### Phase 1: Core Editor Functionality

-   [x] Setup project with Vite, React, Tailwind, and shadcn/ui.
-   [x] Implement the basic UI layout: Structure panel, Editor panel, Preview panel.
-   [x] Create the `CodeMirror` component with custom syntax highlighting for `{{...}}`.
-   [x] Develop the logic to parse the control syntax and generate UI controls.
-   [x] Implement state management with Zustand for the editor.
-   [x] Link UI controls to the prompt content to update the preview in real-time.

### Phase 2: Structuring and Interactivity

-   [x] Implement the "Structural Element" concept.
-   [x] Integrate `dnd-kit` to allow reordering of structural elements.
-   [x] Add functionality to add, remove, and toggle structural elements.
-   [x] Refine the UI for managing structural elements.

### Phase 3: Persistence and Data Management

-   [x] Implement the data models in the application.
-   [x] Develop services to save and load projects/prompts from LocalStorage.
-   [ ] Implement the versioning system.
-   [ ] Build the JSON import/export functionality.

### Phase 4: The Browser and Final Polish

-   [x] Design and build the UI for the Project Browser.
-   [x] Implement folder/tag-based browsing and filtering.
-   [x] Add the in-app error notification system.
-   [x] Conduct thorough testing and bug fixing.
-   [ ] Write documentation and prepare for deployment.