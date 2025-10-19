import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEditorStore } from '@/stores/editorStore';
import { Project, Prompt } from '@/types';
import { Plus, FolderOpen, FileText, Tag, Calendar, Download, Upload, Edit2, Copy, Settings, Search, Layout } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationService } from '@/services/notificationService';
import { useKeyboardShortcuts, CommonShortcuts } from '@/services/keyboardShortcuts';
import { ProjectSettings } from './ProjectSettings';
import { AdvancedSearch } from './AdvancedSearch';
import { ProjectTemplates } from './ProjectTemplates';

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
        setCurrentPrompt
    } = useEditorStore();

    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredProjects = searchResults?.projects || projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
        try {
            const projectData = {
                project,
                prompts: prompts.filter(p => project.prompts.includes(p.id)),
                versions: [] // TODO: Add versions when implemented
            };

            const dataStr = JSON.stringify(projectData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${project.name.replace(/\s+/g, '_')}.json`;
            link.click();
            URL.revokeObjectURL(url);

            NotificationService.projectExported(project.name);
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
        const exportData = {
            prompts: selectedPromptData,
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
        setSearchTerm('');
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
                // TODO: Implement import logic
                console.log('Import data:', data);
            } catch (error) {
                console.error('Error importing project:', error);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b bg-card/50 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Project Browser
                    </h2>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowNewProjectForm(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('import-file')?.click()}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowProjectTemplates(true)}
                        >
                            <Layout className="h-4 w-4 mr-2" />
                            Templates
                        </Button>
                        {selectedProject && projectPrompts.length > 0 && (
                            <Button
                                variant={bulkMode ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setBulkMode(!bulkMode);
                                    setSelectedPrompts(new Set());
                                }}
                            >
                                {bulkMode ? "Exit Bulk" : "Bulk Mode"}
                            </Button>
                        )}
                        <input
                            id="import-file"
                            type="file"
                            accept=".json"
                            onChange={handleImportProject}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Search */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button
                        variant="outline"
                        onClick={() => setShowAdvancedSearch(true)}
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                    {searchResults && (
                        <Button
                            variant="outline"
                            onClick={clearSearchResults}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Projects List */}
                <div className="w-1/2 border-r p-4 overflow-y-auto overflow-x-hidden">
                    <h3 className="font-medium mb-3">Projects</h3>
                    <div className="space-y-2">
                        {filteredProjects.map((project) => (
                            <Card
                                key={project.id}
                                className={`cursor-pointer transition-colors ${selectedProject?.id === project.id ? 'ring-2 ring-primary' : ''
                                    }`}
                                onClick={() => setSelectedProject(project)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{project.name}</span>
                                        </div>
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
                                                <Settings className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExportProject(project);
                                                }}
                                            >
                                                <Download className="h-3 w-3" />
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
                                                ×
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                        {project.tags.length > 0 && (
                                            <>
                                                <Tag className="h-3 w-3" />
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
                    </div>
                </div>

                {/* Prompts List */}
                <div className="w-1/2 p-4 overflow-y-auto overflow-x-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">
                            {selectedProject ? `${selectedProject.name} - Prompts` : 'Select a Project'}
                            {bulkMode && selectedPrompts.size > 0 && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                    ({selectedPrompts.size} selected)
                                </span>
                            )}
                        </h3>
                        <div className="flex gap-2">
                            {bulkMode && selectedPrompts.size > 0 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkExport}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Selected
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                    >
                                        Delete Selected
                                    </Button>
                                </>
                            )}
                            {selectedProject && !bulkMode && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCreatePrompt(selectedProject.id)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Prompt
                                </Button>
                            )}
                        </div>
                    </div>

                    {selectedProject ? (
                        <div className="space-y-2">
                            {projectPrompts.map((prompt) => (
                                <Card
                                    key={prompt.id}
                                    className={`cursor-pointer hover:bg-muted/50 ${bulkMode ? 'border-2' : ''
                                        } ${selectedPrompts.has(prompt.id) ? 'border-primary bg-primary/5' : ''
                                        }`}
                                    onClick={() => {
                                        if (bulkMode) {
                                            handleBulkSelect(prompt.id);
                                        } else {
                                            setCurrentProject(selectedProject);
                                            setCurrentPrompt(prompt);
                                            navigate('/editor');
                                        }
                                    }}
                                >
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-1">
                                                {bulkMode && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPrompts.has(prompt.id)}
                                                        onChange={() => handleBulkSelect(prompt.id)}
                                                        className="h-4 w-4"
                                                    />
                                                )}
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                {editingPrompt === prompt.id ? (
                                                    <Input
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
                                                        className="h-6 text-sm font-medium"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span
                                                        className="font-medium cursor-pointer hover:text-primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!bulkMode) startEditingPrompt(prompt);
                                                        }}
                                                    >
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
                                                            startEditingPrompt(prompt);
                                                        }}
                                                        title="Rename prompt"
                                                    >
                                                        <Edit2 className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDuplicatePrompt(prompt);
                                                        }}
                                                        title="Duplicate prompt"
                                                    >
                                                        <Copy className="h-3 w-3" />
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
                                                        title="Delete prompt"
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                                            {prompt.tags.length > 0 && (
                                                <>
                                                    <Tag className="h-3 w-3" />
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
            </div>

            {/* New Project Form */}
            {showNewProjectForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-96">
                        <CardHeader>
                            <CardTitle>Create New Project</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Project name"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                            />
                            <Input
                                placeholder="Tags (comma-separated)"
                                value={newProjectTags}
                                onChange={(e) => setNewProjectTags(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleCreateProject} className="flex-1">
                                    Create
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowNewProjectForm(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

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
        </div>
    );
}
