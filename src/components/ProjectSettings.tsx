import { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { NotificationService } from '@/services/notificationService';

interface ProjectSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectSettings({ isOpen, onClose }: ProjectSettingsProps) {
    const { currentProject, updateProject } = useEditorStore();
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projectTags, setProjectTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [defaultPromptTemplate, setDefaultPromptTemplate] = useState('');
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [autoSaveInterval, setAutoSaveInterval] = useState(30);
    const [exportFormat, setExportFormat] = useState<'json' | 'markdown' | 'txt'>('json');

    useEffect(() => {
        if (currentProject) {
            setProjectName(currentProject.name);
            setProjectDescription(currentProject.description || '');
            setProjectTags(currentProject.tags || []);
            setDefaultPromptTemplate(currentProject.defaultPromptTemplate || '');
            setAutoSaveEnabled(currentProject.settings?.autoSaveEnabled ?? true);
            setAutoSaveInterval(currentProject.settings?.autoSaveInterval ?? 30);
            setExportFormat(currentProject.settings?.exportFormat ?? 'json');
        }
    }, [currentProject]);

    const handleSave = () => {
        if (!currentProject) return;

        try {
            updateProject(currentProject.id, {
                name: projectName,
                description: projectDescription,
                tags: projectTags,
                defaultPromptTemplate,
                settings: {
                    autoSaveEnabled,
                    autoSaveInterval,
                    exportFormat,
                },
            });

            NotificationService.success('Project settings saved!');
            onClose();
        } catch (error) {
            NotificationService.error(`Failed to save settings: ${error}`);
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !projectTags.includes(newTag.trim())) {
            setProjectTags([...projectTags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setProjectTags(projectTags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTag();
        }
    };

    if (!isOpen || !currentProject) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: 'white', borderRadius: '4px', width: '100%', maxWidth: '768px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⚙️ Project Settings
                    </h3>
                    <button onClick={onClose} style={{ padding: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>
                        ×
                    </button>
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Basic Information */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>Basic Information</h4>

                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="project-name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Project Name</label>
                            <input
                                id="project-name"
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Enter project name"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="project-description" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Description</label>
                            <textarea
                                id="project-description"
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                placeholder="Describe what this project is about..."
                                rows={3}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Tags</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Add a tag"
                                    style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <button onClick={handleAddTag} style={{ padding: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>
                                    ➕
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {projectTags.map((tag) => (
                                    <span key={tag} style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '24px 0' }} />

                    {/* Default Template */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>Default Prompt Template</h4>
                        <div>
                            <label htmlFor="default-template" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Template Content</label>
                            <textarea
                                id="default-template"
                                value={defaultPromptTemplate}
                                onChange={(e) => setDefaultPromptTemplate(e.target.value)}
                                placeholder="Enter default template for new prompts..."
                                rows={4}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
                            />
                            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>
                                This template will be used when creating new prompts in this project.
                            </p>
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '24px 0' }} />

                    {/* Settings */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>Project Settings</h4>

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500' }}>Auto-save</label>
                                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>
                                        Automatically save changes to prompts
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={autoSaveEnabled}
                                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                                    style={{ transform: 'scale(1.2)' }}
                                />
                            </div>

                            {autoSaveEnabled && (
                                <div style={{ marginTop: '16px' }}>
                                    <label htmlFor="auto-save-interval" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Auto-save Interval (seconds)</label>
                                    <input
                                        id="auto-save-interval"
                                        type="number"
                                        min="10"
                                        max="300"
                                        value={autoSaveInterval}
                                        onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="export-format" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Default Export Format</label>
                            <select
                                id="export-format"
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value as 'json' | 'markdown' | 'txt')}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                            >
                                <option value="json">JSON</option>
                                <option value="markdown">Markdown</option>
                                <option value="txt">Plain Text</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px' }}>
                        <button onClick={onClose} style={{ padding: '12px 24px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', borderRadius: '4px' }}>
                            Cancel
                        </button>
                        <button onClick={handleSave} style={{ padding: '12px 24px', border: '1px solid #ccc', background: '#007bff', color: 'white', cursor: 'pointer', borderRadius: '4px' }}>
                            💾 Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
