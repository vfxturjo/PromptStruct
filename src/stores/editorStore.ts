import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StructuralElement, Project, Prompt, Version } from '@/types';

interface EditorState {
    // Current working state
    structure: StructuralElement[];
    previewMode: 'clean' | 'raw';
    currentProject: Project | null;
    currentPrompt: Prompt | null;

    // Data management
    projects: Project[];
    prompts: Prompt[];
    versions: Version[];

    // UI state (persisted)
    uiCollapsedByElementId: Record<string, { text: boolean; controls: boolean }>;
    uiHelpPanelExpanded: boolean;
    uiPanelLayout?: { left: number; right: number };
    uiGlobalControlValues: Record<string, any>;
    uiTextEditorHeight: Record<string, number>; // elementId -> height in pixels

    // Actions
    setPreviewMode: (mode: 'clean' | 'raw') => void;
    updateStructuralElement: (id: string, updates: Partial<StructuralElement>) => void;
    addStructuralElement: (element: Omit<StructuralElement, 'id'>) => void;
    removeStructuralElement: (id: string) => void;
    toggleStructuralElement: (id: string) => void;
    updateStructure: (newStructure: StructuralElement[]) => void;

    // UI actions
    setUiCollapsedForElement: (id: string, collapsed: { text: boolean; controls: boolean }) => void;
    setUiHelpPanelExpanded: (expanded: boolean) => void;
    setUiPanelLayout: (layout: { left: number; right: number } | undefined) => void;
    setUiGlobalControlValues: (values: Record<string, any>) => void;
    setUiCollapsedByElementId: (collapsed: Record<string, { text: boolean; controls: boolean }>) => void;
    setUiTextEditorHeight: (elementId: string, height: number) => void;

    // Project management
    addProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    setCurrentProject: (project: Project | null) => void;
    setProjects: (projects: Project[]) => void;

    // Prompt management
    addPrompt: (prompt: Prompt) => void;
    updatePrompt: (id: string, updates: Partial<Prompt>) => void;
    deletePrompt: (id: string) => void;
    setCurrentPrompt: (prompt: Prompt | null) => void;
    setPrompts: (prompts: Prompt[]) => void;

    // Version management
    addVersion: (version: Version) => void;
    updateVersion: (id: string, updates: Partial<Version>) => void;
    deleteVersion: (id: string) => void;
    setVersions: (versions: Version[]) => void;

    // Utility functions
    saveCurrentPrompt: () => void;
    loadPromptVersion: (versionId: string) => void;
    createNewVersion: () => void;
}

export const useEditorStore = create<EditorState>()(
    persist(
        (set, get) => ({
            // Initial state
            structure: [
                {
                    id: 'struct_1',
                    name: 'Persona',
                    enabled: true,
                    content: 'You are a master storyteller. Your task is to create compelling characters based on the following traits.'
                },
                {
                    id: 'struct_2',
                    name: 'Core Traits',
                    enabled: true,
                    content: 'The character is a {{select:Class:Warrior|Mage|Rogue}} of the {{text:Race:Elven}} race. They are known for their {{text:Key_Virtue:Bravery}}.'
                },
                {
                    id: 'struct_3',
                    name: 'Extra Details',
                    enabled: false,
                    content: '{{toggle:Add_Secret}}They harbor a dark secret: they are secretly afraid of {{text:Secret_Fear:spiders}}.{{/toggle:Add_Secret}}'
                }
            ],
            previewMode: 'clean',
            currentProject: null,
            currentPrompt: null,
            projects: [],
            prompts: [],
            versions: [],
            uiCollapsedByElementId: {},
            uiHelpPanelExpanded: true,
            uiPanelLayout: undefined,
            uiGlobalControlValues: {},
            uiTextEditorHeight: {},

            // Preview mode
            setPreviewMode: (mode) => set({ previewMode: mode }),

            // Structural element management
            updateStructuralElement: (id, updates) =>
                set((state) => ({
                    structure: state.structure.map((element) =>
                        element.id === id ? { ...element, ...updates } : element
                    ),
                })),

            addStructuralElement: (element) =>
                set((state) => ({
                    structure: [
                        ...state.structure,
                        {
                            ...element,
                            // Preserve provided id if present (useful for tests); otherwise generate one
                            id: (element as any).id ?? `struct_${Date.now()}`,
                        },
                    ],
                })),

            removeStructuralElement: (id) =>
                set((state) => ({
                    structure: state.structure.filter((element) => element.id !== id),
                })),

            toggleStructuralElement: (id) =>
                set((state) => ({
                    structure: state.structure.map((element) =>
                        element.id === id ? { ...element, enabled: !element.enabled } : element
                    ),
                })),

            updateStructure: (newStructure) => set({ structure: newStructure }),

            // UI actions
            setUiCollapsedForElement: (id, collapsed) =>
                set((state) => ({
                    uiCollapsedByElementId: { ...state.uiCollapsedByElementId, [id]: collapsed },
                })),
            setUiHelpPanelExpanded: (expanded) => set({ uiHelpPanelExpanded: expanded }),
            setUiPanelLayout: (layout) => set({ uiPanelLayout: layout }),
            setUiGlobalControlValues: (values) => set({ uiGlobalControlValues: values }),
            setUiCollapsedByElementId: (collapsed) => set({ uiCollapsedByElementId: collapsed }),
            setUiTextEditorHeight: (elementId, height) =>
                set((state) => ({
                    uiTextEditorHeight: { ...state.uiTextEditorHeight, [elementId]: height },
                })),

            // Project management
            addProject: (project) =>
                set((state) => ({
                    projects: [...state.projects, project],
                })),

            updateProject: (id, updates) =>
                set((state) => ({
                    projects: state.projects.map((project) =>
                        project.id === id ? { ...project, ...updates } : project
                    ),
                })),

            deleteProject: (id) =>
                set((state) => ({
                    projects: state.projects.filter((project) => project.id !== id),
                    prompts: state.prompts.filter((prompt) => {
                        const project = state.projects.find(p => p.id === id);
                        return project ? !project.prompts.includes(prompt.id) : true;
                    }),
                })),

            setCurrentProject: (project) => set({ currentProject: project }),
            setProjects: (projects) => set({ projects }),

            // Prompt management
            addPrompt: (prompt) =>
                set((state) => ({
                    prompts: [...state.prompts, prompt],
                })),

            updatePrompt: (id, updates) =>
                set((state) => ({
                    prompts: state.prompts.map((prompt) =>
                        prompt.id === id ? { ...prompt, ...updates } : prompt
                    ),
                })),

            deletePrompt: (id) =>
                set((state) => ({
                    prompts: state.prompts.filter((prompt) => prompt.id !== id),
                    versions: state.versions.filter((version) => version.promptId !== id),
                })),

            setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
            setPrompts: (prompts) => set({ prompts }),

            // Version management
            addVersion: (version) =>
                set((state) => ({
                    versions: [...state.versions, version],
                })),

            updateVersion: (id, updates) =>
                set((state) => ({
                    versions: state.versions.map((version) =>
                        version.id === id ? { ...version, ...updates } : version
                    ),
                })),

            deleteVersion: (id) =>
                set((state) => ({
                    versions: state.versions.filter((version) => version.id !== id),
                })),
            setVersions: (versions) => set({ versions }),

            // Utility functions
            saveCurrentPrompt: () => {
                const state = get();
                if (!state.currentPrompt) return;

                // Create a new version with current structure
                const newVersion: Version = {
                    id: `ver_${Date.now()}`,
                    promptId: state.currentPrompt.id,
                    createdAt: new Date().toISOString(),
                    structure: [...state.structure],
                };

                // Add the version
                state.addVersion(newVersion);

                // Update the prompt's current version
                state.updatePrompt(state.currentPrompt.id, {
                    currentVersion: newVersion.id,
                    versions: [...(state.currentPrompt.versions || []), newVersion.id],
                });
            },

            loadPromptVersion: (versionId) => {
                const state = get();
                const version = state.versions.find(v => v.id === versionId);
                if (version) {
                    set({ structure: [...version.structure] });
                }
            },

            createNewVersion: () => {
                const state = get();
                if (!state.currentPrompt) return;

                // Save current state as new version
                state.saveCurrentPrompt();
            },
        }),
        {
            name: 'gemini-editor-storage',
            partialize: (state) => ({
                // Persist core session so refresh restores user's workspace
                structure: state.structure,
                previewMode: state.previewMode,
                projects: state.projects,
                prompts: state.prompts,
                versions: state.versions,
                currentProject: state.currentProject,
                currentPrompt: state.currentPrompt,
                uiCollapsedByElementId: state.uiCollapsedByElementId,
                uiHelpPanelExpanded: state.uiHelpPanelExpanded,
                uiPanelLayout: state.uiPanelLayout,
                uiGlobalControlValues: state.uiGlobalControlValues,
                uiTextEditorHeight: state.uiTextEditorHeight,
            }),
        }
    )
);