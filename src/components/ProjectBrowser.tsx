import { useEditorStore } from '@/stores/editorStore';
import { Project, Prompt } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationService } from '@/services/notificationService';
import { useKeyboardShortcuts, CommonShortcuts } from '@/services/keyboardShortcuts';
import { ProjectSettings } from './ProjectSettings';
import { AdvancedSearch } from './AdvancedSearch';
import { ProjectTemplates } from './ProjectTemplates';
import { ExportOptionsModal } from './ExportOptionsModal';
import { EnhancedSearchBar } from './EnhancedSearchBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TopBar } from './TopBar';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { MiniPreviewPanel } from './MiniPreviewPanel';
import { Search, Plus, Upload, FileText, Settings, Download, X, Edit, Copy, FolderOpen, Calendar, Tag, Star } from 'lucide-react';

export function ProjectBrowser() {
    const {
        projects,
        prompts,
        addProject,
        addPrompt,
        updateProject,
        updatePrompt,
        deleteProject,
        deletePrompt,
        setCurrentProject,
        setCurrentPrompt,
        setProjects,
        setPrompts,
        setVersions,
        setPreviewMode,
        setUiHelpPanelExpanded,
        setUiPanelLayout,
        setUiCollapsedByElementId,
        setUiGlobalControlValues,
        uiShowFavourites,
        versions,
        browserPanels,
        setBrowserPanels
    } = useEditorStore();

    const navigate = useNavigate();
    const panelGroupRef = useRef<any>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showNewProjectForm, setShowNewProjectForm] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectTags, setNewProjectTags] = useState('');
    const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
    const [editingPromptName, setEditingPromptName] = useState('');
    const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set());
    const [bulkMode, setBulkMode] = useState(false);
    const [showProjectSettings, setShowProjectSettings] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [searchResults, setSearchResults] = useState<{ projects: Project[]; prompts: Prompt[] } | null>(null);
    const [showProjectTemplates, setShowProjectTemplates] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportingProject, setExportingProject] = useState<Project | null>(null);
    const [compactActions, setCompactActions] = useState(false);
    const [compactProjectsActions, setCompactProjectsActions] = useState(false);

    // Restore selection on mount
    useEffect(() => {
        const { currentProject } = useEditorStore.getState();
        if (currentProject) {
            setSelectedProject(currentProject);
        }
    }, []);

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            ...CommonShortcuts.NEW_PROJECT,
            action: () => setShowNewProjectForm(true)
        },
        {
            ...CommonShortcuts.NEW_PROMPT,
            action: () => {
                if (selectedProject) {
                    handleCreatePrompt(selectedProject.id);
                }
            }
        },
        {
            ...CommonShortcuts.BULK_MODE,
            action: () => {
                if (selectedProject && projectPrompts.length > 0) {
                    setBulkMode(!bulkMode);
                    setSelectedPrompts(new Set());
                }
            }
        },
        {
            ...CommonShortcuts.SEARCH,
            action: () => {
                const searchInput = document.querySelector('input[placeholder="Search projects..."]') as HTMLInputElement;
                searchInput?.focus();
            }
        },
        {
            ...CommonShortcuts.ESCAPE,
            action: () => {
                if (bulkMode) {
                    setBulkMode(false);
                    setSelectedPrompts(new Set());
                }
                if (showNewProjectForm) {
                    setShowNewProjectForm(false);
                }
                if (editingPrompt) {
                    setEditingPrompt(null);
                    setEditingPromptName('');
                }
            }
        }
    ]);

    const filteredProjects = searchResults?.projects || projects;
    const filteredPrompts = searchResults?.prompts || [];

    // Create virtual Favourites project
    const favouritesProject: Project = {
        id: 'virtual_favourites',
        name: '⭐ Favourites',
        description: 'Your favorite prompts from all projects',
        prompts: prompts.filter(p => p.tags.includes('Favourite')).map(p => p.id),
        tags: ['Favourites'],
        defaultPromptTemplate: '',
        settings: {
            autoSaveEnabled: true,
            autoSaveInterval: 30,
            exportFormat: 'json'
        },
        createdAt: new Date().toISOString()
    };

    // Add Favourites project to the list if enabled and has favourites
    const projectsWithFavourites = uiShowFavourites && favouritesProject.prompts.length > 0
        ? [favouritesProject, ...filteredProjects]
        : filteredProjects;

    const projectPrompts = selectedProject
        ? prompts.filter(prompt => selectedProject.prompts.includes(prompt.id))
        : [];

    const handleCreateProject = () => {
        if (!newProjectName.trim()) return;

        const project: Project = {
            id: `proj_${Date.now()}`,
            name: newProjectName.trim(),
            description: '',
            prompts: [],
            tags: newProjectTags.split(',').map(tag => tag.trim()).filter(Boolean),
            defaultPromptTemplate: '',
            settings: {
                autoSaveEnabled: true,
                autoSaveInterval: 30,
                exportFormat: 'json'
            },
            createdAt: new Date().toISOString()
        };

        addProject(project);
        NotificationService.projectCreated(project.name);
        setNewProjectName('');
        setNewProjectTags('');
        setShowNewProjectForm(false);
    };

    const handleCreatePrompt = (projectId: string) => {
        const prompt: Prompt = {
            id: `prompt_${Date.now()}`,
            name: 'New Prompt',
            versions: [],
            currentVersion: '',
            tags: [],
            createdAt: new Date().toISOString()
        };

        addPrompt(prompt);
        NotificationService.promptCreated(prompt.name);

        // Add prompt to project
        const project = projects.find(p => p.id === projectId);
        if (project) {
            const updatedProject = {
                ...project,
                prompts: [...project.prompts, prompt.id]
            };
            updateProject(projectId, updatedProject);

            // Update selectedProject state to reflect the new prompt
            if (selectedProject?.id === projectId) {
                setSelectedProject(updatedProject);
            }
        }
    };

    const handleExportProject = (project: Project) => {
        setExportingProject(project);
        setShowExportModal(true);
    };

    const handleProjectExportOptions = (options: any) => {
        if (!exportingProject) return;

        try {
            let exportData: any;
            let filename: string;

            if (options.scope === 'current') {
                // Export project metadata only
                exportData = {
                    project: exportingProject,
                    exportedAt: new Date().toISOString(),
                    version: 'metadata'
                };
                filename = `${exportingProject.name.replace(/\s+/g, '_')}_metadata.json`;
            } else {
                // Export project with all prompts and versions
                const projectPrompts = prompts.filter(p => exportingProject.prompts.includes(p.id));
                const projectPromptIds = projectPrompts.map(p => p.id);
                const projectVersions = versions.filter(v => projectPromptIds.includes(v.promptId));

                exportData = {
                    project: exportingProject,
                    prompts: projectPrompts,
                    versions: projectVersions,
                    exportedAt: new Date().toISOString(),
                    version: 'full'
                };
                filename = `${exportingProject.name.replace(/\s+/g, '_')}_full.json`;
            }

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);

            NotificationService.projectExported(exportingProject.name);
        } catch (error) {
            NotificationService.error(`Failed to export project: ${error}`);
        }
    };

    const handleRenamePrompt = (promptId: string, newName: string) => {
        if (!newName.trim()) return;

        updatePrompt(promptId, { name: newName.trim() });
        NotificationService.success(`Prompt renamed to "${newName.trim()}"`);
        setEditingPrompt(null);
        setEditingPromptName('');
    };

    const handleToggleFavourite = (promptId: string) => {
        const prompt = prompts.find(p => p.id === promptId);
        if (!prompt) return;

        const isFavourite = prompt.tags.includes('Favourite');
        const newTags = isFavourite
            ? prompt.tags.filter(tag => tag !== 'Favourite')
            : [...prompt.tags, 'Favourite'];

        updatePrompt(promptId, { tags: newTags });
        NotificationService.success(isFavourite ? 'Removed from favourites' : 'Added to favourites');
    };

    const handleDuplicatePrompt = (prompt: Prompt) => {
        const duplicatedPrompt: Prompt = {
            id: `prompt_${Date.now()}`,
            name: `${prompt.name} (Copy)`,
            versions: [...prompt.versions],
            currentVersion: prompt.currentVersion,
            tags: [...prompt.tags],
            createdAt: new Date().toISOString()
        };

        addPrompt(duplicatedPrompt);
        NotificationService.promptCreated(duplicatedPrompt.name);

        // Add duplicated prompt to the same project
        if (selectedProject) {
            const updatedProject = {
                ...selectedProject,
                prompts: [...selectedProject.prompts, duplicatedPrompt.id]
            };
            updateProject(selectedProject.id, updatedProject);
            setSelectedProject(updatedProject);
        }
    };

    const startEditingPrompt = (prompt: Prompt) => {
        setEditingPrompt(prompt.id);
        setEditingPromptName(prompt.name);
    };

    const handleBulkSelect = (promptId: string) => {
        const newSelected = new Set(selectedPrompts);
        if (newSelected.has(promptId)) {
            newSelected.delete(promptId);
        } else {
            newSelected.add(promptId);
        }
        setSelectedPrompts(newSelected);
    };

    const handleBulkDelete = () => {
        if (selectedPrompts.size === 0) return;

        selectedPrompts.forEach(promptId => {
            deletePrompt(promptId);
        });

        if (selectedProject) {
            const updatedProject = {
                ...selectedProject,
                prompts: selectedProject.prompts.filter(id => !selectedPrompts.has(id))
            };
            setSelectedProject(updatedProject);
        }

        NotificationService.success(`${selectedPrompts.size} prompts deleted successfully!`);
        setSelectedPrompts(new Set());
        setBulkMode(false);
    };

    const handleBulkExport = () => {
        if (selectedPrompts.size === 0) return;

        const selectedPromptData = prompts.filter(p => selectedPrompts.has(p.id));
        const selectedPromptIds = selectedPromptData.map(p => p.id);
        const selectedVersions = versions.filter(v => selectedPromptIds.includes(v.promptId));

        const exportData = {
            prompts: selectedPromptData,
            versions: selectedVersions,
            exportedAt: new Date().toISOString(),
            count: selectedPromptData.length
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bulk_prompts_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);

        NotificationService.success(`${selectedPrompts.size} prompts exported successfully!`);
    };

    const clearSearchResults = () => {
        setSearchResults(null);
    };

    const handleCreateFromTemplate = (template: any) => {
        // Create project from template
        const project: Project = {
            id: `proj_${Date.now()}`,
            name: template.projectData.name,
            description: template.projectData.description,
            prompts: [],
            tags: template.projectData.tags,
            defaultPromptTemplate: template.projectData.defaultPromptTemplate,
            settings: template.projectData.settings,
            createdAt: new Date().toISOString()
        };

        addProject(project);
        NotificationService.projectCreated(project.name);
        setShowProjectTemplates(false);
    };

    const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                let importedProjects = 0;
                let importedPrompts = 0;

                // Detect import format and handle accordingly
                if (data.projects && data.prompts && data.versions && data.uiState) {
                    // Full workspace export
                    importedProjects = data.projects.length;
                    importedPrompts = data.prompts.length;

                    // Merge projects by ID (upsert)
                    const mergedProjects = [...projects];
                    data.projects.forEach((importedProject: Project) => {
                        const existingIndex = mergedProjects.findIndex(p => p.id === importedProject.id);
                        if (existingIndex >= 0) {
                            mergedProjects[existingIndex] = { ...mergedProjects[existingIndex], ...importedProject };
                        } else {
                            mergedProjects.push(importedProject);
                        }
                    });

                    // Merge prompts by ID (upsert)
                    const mergedPrompts = [...prompts];
                    data.prompts.forEach((importedPrompt: Prompt) => {
                        const existingIndex = mergedPrompts.findIndex(p => p.id === importedPrompt.id);
                        if (existingIndex >= 0) {
                            mergedPrompts[existingIndex] = { ...mergedPrompts[existingIndex], ...importedPrompt };
                        } else {
                            mergedPrompts.push(importedPrompt);
                        }
                    });

                    // Merge versions by ID (upsert)
                    const mergedVersions = [...versions];
                    data.versions.forEach((importedVersion: any) => {
                        const existingIndex = mergedVersions.findIndex(v => v.id === importedVersion.id);
                        if (existingIndex >= 0) {
                            mergedVersions[existingIndex] = { ...mergedVersions[existingIndex], ...importedVersion };
                        } else {
                            mergedVersions.push(importedVersion);
                        }
                    });

                    // Apply merged data to store
                    setProjects(mergedProjects);
                    setPrompts(mergedPrompts);
                    setVersions(mergedVersions);

                    // Restore UI state
                    if (data.uiState.previewMode) {
                        setPreviewMode(data.uiState.previewMode);
                    }
                    if (data.uiState.helpPanelExpanded !== undefined) {
                        setUiHelpPanelExpanded(data.uiState.helpPanelExpanded);
                    }
                    if (data.uiState.panelLayout) {
                        setUiPanelLayout(data.uiState.panelLayout);
                    }
                    if (data.uiState.collapsedByElementId) {
                        setUiCollapsedByElementId(data.uiState.collapsedByElementId);
                    }
                    if (data.uiState.globalControlValues) {
                        setUiGlobalControlValues(data.uiState.globalControlValues);
                    }

                    // Restore selection if IDs exist
                    if (data.uiState.currentProjectId) {
                        const project = mergedProjects.find(p => p.id === data.uiState.currentProjectId);
                        if (project) {
                            setCurrentProject(project);
                            setSelectedProject(project);
                        }
                    }
                    if (data.uiState.currentPromptId) {
                        const prompt = mergedPrompts.find(p => p.id === data.uiState.currentPromptId);
                        if (prompt) {
                            setCurrentPrompt(prompt);
                        }
                    }

                } else if (data.project && data.prompts && data.versions) {
                    // Single project export
                    importedProjects = 1;
                    importedPrompts = data.prompts.length;

                    // Add project
                    const existingProjectIndex = projects.findIndex(p => p.id === data.project.id);
                    if (existingProjectIndex >= 0) {
                        const updatedProjects = [...projects];
                        updatedProjects[existingProjectIndex] = { ...updatedProjects[existingProjectIndex], ...data.project };
                        setProjects(updatedProjects);
                    } else {
                        addProject(data.project);
                    }

                    // Add prompts
                    data.prompts.forEach((importedPrompt: Prompt) => {
                        const existingPromptIndex = prompts.findIndex(p => p.id === importedPrompt.id);
                        if (existingPromptIndex >= 0) {
                            const updatedPrompts = [...prompts];
                            updatedPrompts[existingPromptIndex] = { ...updatedPrompts[existingPromptIndex], ...importedPrompt };
                            setPrompts(updatedPrompts);
                        } else {
                            addPrompt(importedPrompt);
                        }
                    });

                    // Add versions
                    data.versions.forEach((importedVersion: any) => {
                        const existingVersionIndex = versions.findIndex(v => v.id === importedVersion.id);
                        if (existingVersionIndex >= 0) {
                            const updatedVersions = [...versions];
                            updatedVersions[existingVersionIndex] = { ...updatedVersions[existingVersionIndex], ...importedVersion };
                            setVersions(updatedVersions);
                        } else {
                            // Add version through store
                            const state = useEditorStore.getState();
                            state.addVersion(importedVersion);
                        }
                    });

                } else if (data.prompts && data.versions) {
                    // Bulk prompts export
                    importedPrompts = data.prompts.length;

                    // Add prompts
                    data.prompts.forEach((importedPrompt: Prompt) => {
                        const existingPromptIndex = prompts.findIndex(p => p.id === importedPrompt.id);
                        if (existingPromptIndex >= 0) {
                            const updatedPrompts = [...prompts];
                            updatedPrompts[existingPromptIndex] = { ...updatedPrompts[existingPromptIndex], ...importedPrompt };
                            setPrompts(updatedPrompts);
                        } else {
                            addPrompt(importedPrompt);
                        }
                    });

                    // Add versions
                    data.versions.forEach((importedVersion: any) => {
                        const existingVersionIndex = versions.findIndex(v => v.id === importedVersion.id);
                        if (existingVersionIndex >= 0) {
                            const updatedVersions = [...versions];
                            updatedVersions[existingVersionIndex] = { ...updatedVersions[existingVersionIndex], ...importedVersion };
                            setVersions(updatedVersions);
                        } else {
                            // Add version through store
                            const state = useEditorStore.getState();
                            state.addVersion(importedVersion);
                        }
                    });

                } else if (data.prompt && (data.structure || data.versions)) {
                    // Single prompt export
                    importedPrompts = 1;

                    // Add prompt
                    const existingPromptIndex = prompts.findIndex(p => p.id === data.prompt.id);
                    if (existingPromptIndex >= 0) {
                        const updatedPrompts = [...prompts];
                        updatedPrompts[existingPromptIndex] = { ...updatedPrompts[existingPromptIndex], ...data.prompt };
                        setPrompts(updatedPrompts);
                    } else {
                        addPrompt(data.prompt);
                    }

                    // Handle versions if present
                    if (data.versions) {
                        data.versions.forEach((importedVersion: any) => {
                            const existingVersionIndex = versions.findIndex(v => v.id === importedVersion.id);
                            if (existingVersionIndex >= 0) {
                                const updatedVersions = [...versions];
                                updatedVersions[existingVersionIndex] = { ...updatedVersions[existingVersionIndex], ...importedVersion };
                                setVersions(updatedVersions);
                            } else {
                                // Add version through store
                                const state = useEditorStore.getState();
                                state.addVersion(importedVersion);
                            }
                        });
                    }

                    // If it's current version only, we could optionally load it into the editor
                    if (data.structure && data.version === 'current') {
                        // This could be used to load the prompt into the editor
                        // For now, we just import the data
                    }

                } else {
                    NotificationService.error('Invalid import file format. Expected workspace, project, prompts, or prompt export.');
                    return;
                }

                // Show import summary
                let summary = '';
                if (importedProjects > 0 && importedPrompts > 0) {
                    summary = `Imported ${importedProjects} project${importedProjects > 1 ? 's' : ''} and ${importedPrompts} prompt${importedPrompts > 1 ? 's' : ''}`;
                } else if (importedProjects > 0) {
                    summary = `Imported ${importedProjects} project${importedProjects > 1 ? 's' : ''}`;
                } else if (importedPrompts > 0) {
                    summary = `Imported ${importedPrompts} prompt${importedPrompts > 1 ? 's' : ''}`;
                }

                NotificationService.success(`${summary} successfully!`);
            } catch (error) {
                NotificationService.error(`Import failed: ${error}`);
            }
        };
        reader.readAsText(file);

        // Reset file input to allow importing the same file again
        event.target.value = '';
    };

    return (
        <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
            <TopBar
                title="PromptStruct"
                subtitle="Project Browser"
                additionalButtons={(
                    <>
                        <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                        </Button>
                        <input
                            id="import-file"
                            type="file"
                            accept=".json"
                            onChange={handleImportProject}
                            className="hidden"
                        />
                        <Button variant="outline" onClick={() => setShowProjectTemplates(true)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Templates
                        </Button>
                    </>
                )}
            />

            {/* Search Section (full width) */}
            {browserPanels.showSearchBar && (
                <div className="panel-padding border-b">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="md:flex-1">
                            <EnhancedSearchBar
                                projects={projects}
                                prompts={prompts}
                                onSearchResults={setSearchResults}
                                onClearResults={clearSearchResults}
                            />
                        </div>
                        <div className="flex gap-2 self-end md:self-auto md:ml-4">
                            <Button variant="outline" onClick={() => setShowAdvancedSearch(true)}>
                                <Search className="w-4 h-4 mr-2" />
                                Advanced Search
                            </Button>
                            {searchResults && (
                                <Button variant="outline" onClick={clearSearchResults}>
                                    Clear Results
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup ref={panelGroupRef} direction="horizontal" autoSaveId="project-browser-layout" onLayout={(sizes) => {
                    if (sizes[0] < 8 && browserPanels.showProjects) setBrowserPanels({ showProjects: false });
                    if (sizes[2] < 8 && browserPanels.showDirectUsePreview) setBrowserPanels({ showDirectUsePreview: false });
                }}>
                    <ResizablePanel defaultSize={35} minSize={8} collapsible onCollapse={() => setBrowserPanels({ showProjects: false })} onExpand={() => setBrowserPanels({ showProjects: true })}>
                        <div className="h-full border-r panel-padding overflow-y-auto" ref={(el) => {
                            if (!el) return;
                            const ro = new ResizeObserver((entries) => {
                                for (const entry of entries) {
                                    const width = entry.contentRect.width;
                                    setCompactProjectsActions(width < 400);
                                }
                            });
                            ro.observe(el);
                        }}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">
                                    {searchResults ? 'Search Results' : 'Projects'}
                                </h3>
                                {!searchResults && (
                                    <>
                                        <Button onClick={() => setShowNewProjectForm(true)} className={compactProjectsActions ? 'hidden' : 'inline-flex'}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            New Project
                                        </Button>
                                        <Button onClick={() => setShowNewProjectForm(true)} size="icon" className={compactProjectsActions ? 'inline-flex' : 'hidden'} title="New Project">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                            <div className="space-y-2">
                                {/* Show Projects */}
                                {projectsWithFavourites.map((project) => (
                                    <Card
                                        key={project.id}
                                        onClick={() => setSelectedProject(project)}
                                        className={`cursor-pointer transition-colors ${selectedProject?.id === project.id ? 'bg-accent' : ''
                                            }`}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FolderOpen className="w-4 h-4" />
                                                    <strong>{project.name}</strong>
                                                    {searchResults && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Project
                                                        </Badge>
                                                    )}
                                                </div>
                                                {project.id !== 'virtual_favourites' && (
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedProject(project);
                                                                setShowProjectSettings(true);
                                                            }}
                                                        >
                                                            <Settings className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleExportProject(project);
                                                            }}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteProject(project.id);
                                                                if (selectedProject?.id === project.id) {
                                                                    setSelectedProject(null);
                                                                }
                                                            }}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                                {project.tags.length > 0 && (
                                                    <>
                                                        <Tag className="w-3 h-3" />
                                                        <div className="flex gap-1">
                                                            {project.tags.slice(0, 2).map((tag) => (
                                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                            {project.tags.length > 2 && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    +{project.tags.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Show Prompts in Search Results */}
                                {searchResults && filteredPrompts.map((prompt) => {
                                    const parentProject = projects.find(p => p.prompts.includes(prompt.id));
                                    return (
                                        <Card
                                            key={prompt.id}
                                            onClick={() => {
                                                if (parentProject) {
                                                    setSelectedProject(parentProject);
                                                    setCurrentProject(parentProject);
                                                    setCurrentPrompt(prompt);
                                                    navigate('/editor');
                                                }
                                            }}
                                            className="cursor-pointer transition-colors hover:bg-accent"
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4" />
                                                        <strong>{prompt.name}</strong>
                                                        <Badge variant="outline" className="text-xs">
                                                            Prompt
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                                                    {parentProject && (
                                                        <>
                                                            <FolderOpen className="w-3 h-3" />
                                                            <span>in {parentProject.name}</span>
                                                        </>
                                                    )}
                                                    {prompt.tags.length > 0 && (
                                                        <>
                                                            <Tag className="w-3 h-3" />
                                                            <div className="flex gap-1">
                                                                {prompt.tags.slice(0, 2).map((tag) => (
                                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />

                    {/* Prompts List */}
                    <ResizablePanel defaultSize={browserPanels.showDirectUsePreview ? 35 : 65} minSize={20}>
                        <div className="h-full panel-padding overflow-y-auto" id="prompts-panel" ref={(el) => {
                            if (!el) return;
                            const ro = new ResizeObserver((entries) => {
                                for (const entry of entries) {
                                    const width = entry.contentRect.width;
                                    setCompactActions(width < 520);
                                }
                            });
                            ro.observe(el);
                        }}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">
                                    {selectedProject ? `${selectedProject.name} - Prompts` : 'Select a Project'}
                                    {bulkMode && selectedPrompts.size > 0 && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                            ({selectedPrompts.size} selected)
                                        </span>
                                    )}
                                </h3>
                                <div className="flex gap-2" id="prompts-actions">
                                    {bulkMode && selectedPrompts.size > 0 && (
                                        <>
                                            <Button variant="outline" onClick={handleBulkExport} className={compactActions ? 'hidden' : 'inline-flex'}>
                                                <Download className="w-4 h-4 mr-2" />
                                                Export Selected
                                            </Button>
                                            <Button variant="destructive" onClick={handleBulkDelete} className={compactActions ? 'hidden' : 'inline-flex'}>
                                                Delete Selected
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={handleBulkExport} className={compactActions ? 'inline-flex' : 'hidden'} title="Export Selected">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={handleBulkDelete} className={compactActions ? 'inline-flex' : 'hidden'} title="Delete Selected">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                    {selectedProject && !bulkMode && (
                                        <>
                                            {projectPrompts.length > 0 && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setBulkMode(true);
                                                            setSelectedPrompts(new Set());
                                                        }}
                                                        className={compactActions ? 'hidden' : 'inline-flex'}
                                                    >
                                                        Bulk Mode
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => {
                                                            setBulkMode(true);
                                                            setSelectedPrompts(new Set());
                                                        }}
                                                        className={compactActions ? 'inline-flex' : 'hidden'}
                                                        title="Bulk Mode"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button onClick={() => handleCreatePrompt(selectedProject.id)} className={compactActions ? 'hidden' : 'inline-flex'}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                New Prompt
                                            </Button>
                                            <Button onClick={() => handleCreatePrompt(selectedProject.id)} size="icon" className={compactActions ? 'inline-flex' : 'hidden'} title="New Prompt">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {selectedProject ? (
                                <div className="space-y-2">
                                    {projectPrompts.map((prompt) => (
                                        <Card
                                            key={prompt.id}
                                            onClick={() => {
                                                if (bulkMode) {
                                                    handleBulkSelect(prompt.id);
                                                } else {
                                                    setCurrentProject(selectedProject);
                                                    setCurrentPrompt(prompt);
                                                    navigate('/editor');
                                                }
                                            }}
                                            className={`cursor-pointer transition-colors ${selectedPrompts.has(prompt.id) ? 'bg-accent' : ''
                                                }`}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        {bulkMode && (
                                                            <Checkbox
                                                                checked={selectedPrompts.has(prompt.id)}
                                                                onChange={() => handleBulkSelect(prompt.id)}
                                                            />
                                                        )}
                                                        <FileText className="w-4 h-4" />
                                                        {editingPrompt === prompt.id ? (
                                                            <Input
                                                                type="text"
                                                                value={editingPromptName}
                                                                onChange={(e) => setEditingPromptName(e.target.value)}
                                                                onBlur={() => handleRenamePrompt(prompt.id, editingPromptName)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleRenamePrompt(prompt.id, editingPromptName);
                                                                    } else if (e.key === 'Escape') {
                                                                        setEditingPrompt(null);
                                                                        setEditingPromptName('');
                                                                    }
                                                                }}
                                                                className="h-6"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className="font-medium">
                                                                {prompt.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {!bulkMode && (
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleToggleFavourite(prompt.id);
                                                                }}
                                                                className={prompt.tags.includes('Favourite') ? 'text-yellow-500' : 'text-muted-foreground'}
                                                                title={prompt.tags.includes('Favourite') ? 'Remove from favourites' : 'Add to favourites'}
                                                            >
                                                                <Star className={`w-4 h-4 ${prompt.tags.includes('Favourite') ? 'fill-current' : ''}`} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    startEditingPrompt(prompt);
                                                                }}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDuplicatePrompt(prompt);
                                                                }}
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deletePrompt(prompt.id);

                                                                    // Update selectedProject to remove the deleted prompt
                                                                    if (selectedProject) {
                                                                        const updatedProject = {
                                                                            ...selectedProject,
                                                                            prompts: selectedProject.prompts.filter(id => id !== prompt.id)
                                                                        };
                                                                        setSelectedProject(updatedProject);
                                                                    }
                                                                }}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                                                    {prompt.tags.length > 0 && (
                                                        <>
                                                            <Tag className="w-3 h-3" />
                                                            <div className="flex gap-1">
                                                                {prompt.tags.slice(0, 2).map((tag) => (
                                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {projectPrompts.length === 0 && (
                                        <div className="text-center text-muted-foreground py-8">
                                            No prompts yet. Create one to get started.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    Select a project to view its prompts.
                                </div>
                            )}
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={30} minSize={8} collapsible onCollapse={() => setBrowserPanels({ showDirectUsePreview: false })} onExpand={() => setBrowserPanels({ showDirectUsePreview: true })}>
                        <MiniPreviewPanel />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>

            {/* New Project Form */}
            <Dialog open={showNewProjectForm} onOpenChange={setShowNewProjectForm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project Name</Label>
                            <Input
                                id="project-name"
                                type="text"
                                placeholder="Project name"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project-tags">Tags (comma-separated)</Label>
                            <Input
                                id="project-tags"
                                type="text"
                                placeholder="Tags (comma-separated)"
                                value={newProjectTags}
                                onChange={(e) => setNewProjectTags(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewProjectForm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateProject}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Project Settings Modal */}
            <ProjectSettings
                isOpen={showProjectSettings}
                onClose={() => setShowProjectSettings(false)}
            />

            {/* Advanced Search Modal */}
            <AdvancedSearch
                isOpen={showAdvancedSearch}
                projects={projects}
                prompts={prompts}
                onSearchResults={setSearchResults}
                onClose={() => setShowAdvancedSearch(false)}
            />

            {/* Project Templates Modal */}
            <ProjectTemplates
                isOpen={showProjectTemplates}
                onClose={() => setShowProjectTemplates(false)}
                onCreateFromTemplate={handleCreateFromTemplate}
            />

            {/* Export Options Modal */}
            <ExportOptionsModal
                isOpen={showExportModal}
                onClose={() => {
                    setShowExportModal(false);
                    setExportingProject(null);
                }}
                onExport={handleProjectExportOptions}
                exportType="project"
                project={exportingProject}
                versions={versions}
            />
        </div>
    );
}
