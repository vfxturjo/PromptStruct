// Core data types for PromptStruct

export interface ProjectSettings {
    autoSaveEnabled: boolean;
    autoSaveInterval: number;
    exportFormat: 'json' | 'markdown' | 'txt';
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    prompts: string[];
    tags: string[];
    defaultPromptTemplate?: string;
    settings?: ProjectSettings;
    createdAt: string;
}

export interface Prompt {
    id: string;
    name: string;
    versions: string[];
    currentVersion: string;
    tags: string[];
    createdAt: string;
}

export interface StructuralElement {
    id: string;
    name: string;
    enabled: boolean;
    content: string;
}

export interface Version {
    id: string;
    promptId: string;
    createdAt: string;
    structure: StructuralElement[];
}

// Control types for the {{...}} syntax
export interface ControlElement {
    type: 'text' | 'toggle' | 'slider' | 'select';
    name: string;
    defaultValue?: string;
    options?: string[]; // for select type
    min?: number; // for slider type
    max?: number; // for slider type
    start?: number; // for toggle type
    end?: number; // for toggle type
}

export interface ParsedControl {
    element: ControlElement;
    startIndex: number;
    endIndex: number;
    content?: string; // for toggle blocks
}

// Editor state
export interface EditorState {
    currentProject: Project | null;
    currentPrompt: Prompt | null;
    currentVersion: Version | null;
    structure: StructuralElement[];
    previewMode: 'clean' | 'raw';
}
