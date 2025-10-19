import { useEditorStore } from '@/stores/editorStore';
import { Project, Prompt } from '@/types';
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
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #ccc' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                        Project Browser
                    </h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setShowNewProjectForm(true)}
                            style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                        >
                            ➕ New Project
                        </button>
                        <button
                            onClick={() => document.getElementById('import-file')?.click()}
                            style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                        >
                            📤 Import
                        </button>
                        <button
                            onClick={() => setShowProjectTemplates(true)}
                            style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                        >
                            📋 Templates
                        </button>
                        {selectedProject && projectPrompts.length > 0 && (
                            <button
                                onClick={() => {
                                    setBulkMode(!bulkMode);
                                    setSelectedPrompts(new Set());
                                }}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #ccc',
                                    background: bulkMode ? '#007bff' : 'white',
                                    color: bulkMode ? 'white' : 'black',
                                    cursor: 'pointer'
                                }}
                            >
                                {bulkMode ? "Exit Bulk" : "Bulk Mode"}
                            </button>
                        )}
                        <input
                            id="import-file"
                            type="file"
                            accept=".json"
                            onChange={handleImportProject}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                {/* Search */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />
                    <button
                        onClick={() => setShowAdvancedSearch(true)}
                        style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                    >
                        🔍
                    </button>
                    {searchResults && (
                        <button
                            onClick={clearSearchResults}
                            style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex' }}>
                {/* Projects List */}
                <div style={{ width: '50%', borderRight: '1px solid #ccc', padding: '16px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>Projects</h3>
                    <div>
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => setSelectedProject(project)}
                                style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    marginBottom: '8px',
                                    cursor: 'pointer',
                                    background: selectedProject?.id === project.id ? '#f0f8ff' : 'white'
                                }}
                            >
                                <div style={{ padding: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>📁</span>
                                            <strong>{project.name}</strong>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedProject(project);
                                                    setShowProjectSettings(true);
                                                }}
                                                style={{ padding: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                                title="Settings"
                                            >
                                                ⚙️
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExportProject(project);
                                                }}
                                                style={{ padding: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                                title="Export"
                                            >
                                                📥
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteProject(project.id);
                                                    if (selectedProject?.id === project.id) {
                                                        setSelectedProject(null);
                                                    }
                                                }}
                                                style={{ padding: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                                title="Delete"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                                        <span>📅</span>
                                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                        {project.tags.length > 0 && (
                                            <>
                                                <span>🏷️</span>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    {project.tags.slice(0, 2).map((tag) => (
                                                        <span key={tag} style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '2px', fontSize: '10px' }}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {project.tags.length > 2 && (
                                                        <span style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '2px', fontSize: '10px' }}>
                                                            +{project.tags.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Prompts List */}
                <div style={{ width: '50%', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                            {selectedProject ? `${selectedProject.name} - Prompts` : 'Select a Project'}
                            {bulkMode && selectedPrompts.size > 0 && (
                                <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                                    ({selectedPrompts.size} selected)
                                </span>
                            )}
                        </h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {bulkMode && selectedPrompts.size > 0 && (
                                <>
                                    <button
                                        onClick={handleBulkExport}
                                        style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                    >
                                        📥 Export Selected
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#dc3545', color: 'white', cursor: 'pointer' }}
                                    >
                                        Delete Selected
                                    </button>
                                </>
                            )}
                            {selectedProject && !bulkMode && (
                                <button
                                    onClick={() => handleCreatePrompt(selectedProject.id)}
                                    style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                >
                                    ➕ New Prompt
                                </button>
                            )}
                        </div>
                    </div>

                    {selectedProject ? (
                        <div>
                            {projectPrompts.map((prompt) => (
                                <div
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
                                    style={{
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        marginBottom: '8px',
                                        cursor: 'pointer',
                                        background: selectedPrompts.has(prompt.id) ? '#f0f8ff' : 'white'
                                    }}
                                >
                                    <div style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                                {bulkMode && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPrompts.has(prompt.id)}
                                                        onChange={() => handleBulkSelect(prompt.id)}
                                                        style={{ transform: 'scale(1.2)' }}
                                                    />
                                                )}
                                                <span>📄</span>
                                                {editingPrompt === prompt.id ? (
                                                    <input
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
                                                        style={{ height: '24px', padding: '4px', border: '1px solid #ccc', borderRadius: '2px' }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!bulkMode) startEditingPrompt(prompt);
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {prompt.name}
                                                    </span>
                                                )}
                                            </div>
                                            {!bulkMode && (
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startEditingPrompt(prompt);
                                                        }}
                                                        style={{ padding: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                                        title="Rename prompt"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDuplicatePrompt(prompt);
                                                        }}
                                                        style={{ padding: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                                        title="Duplicate prompt"
                                                    >
                                                        📋
                                                    </button>
                                                    <button
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
                                                        style={{ padding: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                                        title="Delete prompt"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                                            <span>📅</span>
                                            <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                                            {prompt.tags.length > 0 && (
                                                <>
                                                    <span>🏷️</span>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {prompt.tags.slice(0, 2).map((tag) => (
                                                            <span key={tag} style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '2px', fontSize: '10px' }}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {projectPrompts.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#666', padding: '32px' }}>
                                    No prompts yet. Create one to get started.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666', padding: '32px' }}>
                            Select a project to view its prompts.
                        </div>
                    )}
                </div>
            </div>

            {/* New Project Form */}
            {showNewProjectForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 50 }}>
                    <div style={{ background: 'white', borderRadius: '4px', width: '384px' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #ccc' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Create New Project</h3>
                        </div>
                        <div style={{ padding: '16px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <input
                                    type="text"
                                    placeholder="Project name"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <input
                                    type="text"
                                    placeholder="Tags (comma-separated)"
                                    value={newProjectTags}
                                    onChange={(e) => setNewProjectTags(e.target.value)}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handleCreateProject}
                                    style={{ flex: 1, padding: '12px', border: '1px solid #ccc', background: '#007bff', color: 'white', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => setShowNewProjectForm(false)}
                                    style={{ flex: 1, padding: '12px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
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
