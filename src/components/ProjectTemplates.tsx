import { useState, useEffect } from 'react';

interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    projectData: {
        name: string;
        description: string;
        tags: string[];
        defaultPromptTemplate: string;
        settings: any;
    };
    prompts: Array<{
        name: string;
        tags: string[];
        versions: Array<{
            structure: any[];
        }>;
    }>;
    isBuiltIn: boolean;
    createdAt: string;
    usageCount: number;
}

interface ProjectTemplatesProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateFromTemplate: (template: ProjectTemplate) => void;
}

export function ProjectTemplates({ isOpen, onClose, onCreateFromTemplate }: ProjectTemplatesProps) {
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTemplate, setNewTemplate] = useState<Partial<ProjectTemplate>>({
        name: '',
        description: '',
        category: 'general',
        tags: []
    });

    // Built-in templates
    const builtInTemplates: ProjectTemplate[] = [
        {
            id: 'template_creative_writing',
            name: 'Creative Writing Assistant',
            description: 'Template for creative writing projects with character development, plot structure, and style controls.',
            category: 'writing',
            tags: ['creative', 'writing', 'storytelling'],
            projectData: {
                name: 'Creative Writing Project',
                description: 'A project for creative writing assistance',
                tags: ['creative', 'writing'],
                defaultPromptTemplate: 'You are a creative writing assistant. Help me with {{text:Task:writing a story}} in the {{select:Genre:Fantasy|Sci-Fi|Mystery|Romance}} genre.',
                settings: {
                    autoSaveEnabled: true,
                    autoSaveInterval: 30,
                    exportFormat: 'markdown'
                }
            },
            prompts: [
                {
                    name: 'Character Generator',
                    tags: ['character', 'development'],
                    versions: [{
                        structure: [
                            {
                                id: 'char_1',
                                name: 'Character Basics',
                                enabled: true,
                                content: 'Create a character with the following traits:\n- Name: {{text:CharacterName:Alex}}\n- Age: {{slider:Age:25}}\n- Background: {{text:Background:Merchant}}'
                            },
                            {
                                id: 'char_2',
                                name: 'Personality',
                                enabled: true,
                                content: 'Their personality is {{select:Personality:Bold|Cautious|Mysterious|Charming}}. They are known for being {{text:KeyTrait:brave}}.'
                            }
                        ]
                    }]
                },
                {
                    name: 'Plot Generator',
                    tags: ['plot', 'structure'],
                    versions: [{
                        structure: [
                            {
                                id: 'plot_1',
                                name: 'Plot Setup',
                                enabled: true,
                                content: 'The story begins when {{text:ProtagonistName:the hero}} discovers {{text:IncitingIncident:a mysterious artifact}}.'
                            },
                            {
                                id: 'plot_2',
                                name: 'Conflict',
                                enabled: true,
                                content: 'The main conflict is {{text:Conflict:overcoming their fears}} while facing {{text:Antagonist:the villain}}.'
                            }
                        ]
                    }]
                }
            ],
            isBuiltIn: true,
            createdAt: '2025-01-01T00:00:00Z',
            usageCount: 0
        },
        {
            id: 'template_business_writing',
            name: 'Business Writing Assistant',
            description: 'Template for professional business writing including emails, reports, and proposals.',
            category: 'business',
            tags: ['business', 'professional', 'communication'],
            projectData: {
                name: 'Business Writing Project',
                description: 'A project for professional business writing',
                tags: ['business', 'professional'],
                defaultPromptTemplate: 'You are a professional business writing assistant. Help me create {{select:DocumentType:Email|Report|Proposal|Presentation}} for {{text:Audience:clients}}.',
                settings: {
                    autoSaveEnabled: true,
                    autoSaveInterval: 60,
                    exportFormat: 'txt'
                }
            },
            prompts: [
                {
                    name: 'Email Generator',
                    tags: ['email', 'communication'],
                    versions: [{
                        structure: [
                            {
                                id: 'email_1',
                                name: 'Email Structure',
                                enabled: true,
                                content: 'Subject: {{text:Subject:Meeting Request}}\n\nDear {{text:Recipient:Team}},\n\nI hope this email finds you well. {{text:Purpose:I would like to schedule a meeting}} to discuss {{text:Topic:project updates}}.'
                            }
                        ]
                    }]
                }
            ],
            isBuiltIn: true,
            createdAt: '2025-01-01T00:00:00Z',
            usageCount: 0
        },
        {
            id: 'template_code_review',
            name: 'Code Review Assistant',
            description: 'Template for code review and technical documentation with programming language support.',
            category: 'development',
            tags: ['code', 'review', 'technical', 'programming'],
            projectData: {
                name: 'Code Review Project',
                description: 'A project for code review and technical assistance',
                tags: ['code', 'review'],
                defaultPromptTemplate: 'You are a senior software engineer. Review this {{select:Language:JavaScript|Python|Java|C++}} code and provide feedback on {{text:Aspect:performance}}.',
                settings: {
                    autoSaveEnabled: true,
                    autoSaveInterval: 45,
                    exportFormat: 'markdown'
                }
            },
            prompts: [
                {
                    name: 'Code Review',
                    tags: ['review', 'feedback'],
                    versions: [{
                        structure: [
                            {
                                id: 'review_1',
                                name: 'Code Analysis',
                                enabled: true,
                                content: 'Analyze the following code for {{select:Focus:Performance|Security|Readability|Best Practices}}:\n\n```{{select:Language:javascript|python|java|cpp}}\n{{text:Code:// Your code here}}\n```'
                            },
                            {
                                id: 'review_2',
                                name: 'Suggestions',
                                enabled: true,
                                content: 'Provide specific suggestions for improvement:\n1. {{text:Suggestion1:Optimize the algorithm}}\n2. {{text:Suggestion2:Add error handling}}\n3. {{text:Suggestion3:Improve variable naming}}'
                            }
                        ]
                    }]
                }
            ],
            isBuiltIn: true,
            createdAt: '2025-01-01T00:00:00Z',
            usageCount: 0
        }
    ];

    // Load templates from localStorage
    useEffect(() => {
        const savedTemplates = localStorage.getItem('gemini-project-templates');
        if (savedTemplates) {
            const parsed = JSON.parse(savedTemplates);
            setTemplates([...builtInTemplates, ...parsed]);
        } else {
            setTemplates(builtInTemplates);
        }
    }, []);

    const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

    const filteredTemplates = templates.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleCreateTemplate = () => {
        if (!newTemplate.name?.trim()) return;

        const template: ProjectTemplate = {
            id: `template_${Date.now()}`,
            name: newTemplate.name.trim(),
            description: newTemplate.description || '',
            category: newTemplate.category || 'general',
            tags: newTemplate.tags || [],
            projectData: {
                name: `New ${newTemplate.name}`,
                description: newTemplate.description || '',
                tags: newTemplate.tags || [],
                defaultPromptTemplate: '',
                settings: {
                    autoSaveEnabled: true,
                    autoSaveInterval: 30,
                    exportFormat: 'json'
                }
            },
            prompts: [],
            isBuiltIn: false,
            createdAt: new Date().toISOString(),
            usageCount: 0
        };

        const newTemplates = [...templates, template];
        setTemplates(newTemplates);

        // Save to localStorage (excluding built-in templates)
        const customTemplates = newTemplates.filter(t => !t.isBuiltIn);
        localStorage.setItem('gemini-project-templates', JSON.stringify(customTemplates));

        setNewTemplate({ name: '', description: '', category: 'general', tags: [] });
        setShowCreateForm(false);
    };

    const handleDeleteTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template?.isBuiltIn) return; // Can't delete built-in templates

        const newTemplates = templates.filter(t => t.id !== templateId);
        setTemplates(newTemplates);

        const customTemplates = newTemplates.filter(t => !t.isBuiltIn);
        localStorage.setItem('gemini-project-templates', JSON.stringify(customTemplates));
    };

    const handleExportTemplate = (template: ProjectTemplate) => {
        const dataStr = JSON.stringify(template, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.name.replace(/\s+/g, '_')}_template.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const template: ProjectTemplate = JSON.parse(e.target?.result as string);
                template.id = `template_${Date.now()}`;
                template.isBuiltIn = false;
                template.createdAt = new Date().toISOString();
                template.usageCount = 0;

                const newTemplates = [...templates, template];
                setTemplates(newTemplates);

                const customTemplates = newTemplates.filter(t => !t.isBuiltIn);
                localStorage.setItem('gemini-project-templates', JSON.stringify(customTemplates));
            } catch (error) {
                console.error('Failed to import template:', error);
            }
        };
        reader.readAsText(file);
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: 'white', borderRadius: '4px', width: '100%', maxWidth: '1536px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📋 Project Templates
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportTemplate}
                            style={{ display: 'none' }}
                            id="import-template"
                        />
                        <label htmlFor="import-template" style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', borderRadius: '4px' }}>
                            📤 Import
                        </label>
                        <button onClick={() => setShowCreateForm(true)} style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>
                            ➕ Create Template
                        </button>
                        <button onClick={onClose} style={{ padding: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>
                            ×
                        </button>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Search and Filters */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Create Template Form */}
                    {showCreateForm && (
                        <div style={{ border: '1px solid #ccc', borderRadius: '4px', marginBottom: '24px' }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #ccc' }}>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Create New Template</h4>
                            </div>
                            <div style={{ padding: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label htmlFor="template-name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Template Name</label>
                                        <input
                                            id="template-name"
                                            type="text"
                                            value={newTemplate.name || ''}
                                            onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Enter template name"
                                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="template-category" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Category</label>
                                        <select
                                            id="template-category"
                                            value={newTemplate.category || 'general'}
                                            onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                                        >
                                            <option value="general">General</option>
                                            <option value="writing">Writing</option>
                                            <option value="business">Business</option>
                                            <option value="development">Development</option>
                                            <option value="education">Education</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label htmlFor="template-description" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Description</label>
                                    <textarea
                                        id="template-description"
                                        value={newTemplate.description || ''}
                                        onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe what this template is for..."
                                        rows={3}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <button onClick={() => setShowCreateForm(false)} style={{ padding: '12px 24px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', borderRadius: '4px' }}>
                                        Cancel
                                    </button>
                                    <button onClick={handleCreateTemplate} style={{ padding: '12px 24px', border: '1px solid #ccc', background: '#007bff', color: 'white', cursor: 'pointer', borderRadius: '4px' }}>
                                        Create Template
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Templates Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {filteredTemplates.map(template => (
                            <div key={template.id} style={{ border: '1px solid #ccc', borderRadius: '4px', position: 'relative' }}>
                                <div style={{ padding: '16px', borderBottom: '1px solid #ccc' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {template.name}
                                                {template.isBuiltIn && (
                                                    <span style={{ fontSize: '12px', color: '#ffc107' }}>⭐</span>
                                                )}
                                            </h4>
                                            <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                                                {template.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                                        <span style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '2px', fontSize: '10px' }}>
                                            {template.category}
                                        </span>
                                        {template.tags.slice(0, 2).map(tag => (
                                            <span key={tag} style={{ background: '#e0e0e0', padding: '2px 6px', borderRadius: '2px', fontSize: '10px' }}>
                                                {tag}
                                            </span>
                                        ))}
                                        {template.tags.length > 2 && (
                                            <span style={{ background: '#e0e0e0', padding: '2px 6px', borderRadius: '2px', fontSize: '10px' }}>
                                                +{template.tags.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: '16px' }}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            <div>Prompts: {template.prompts.length}</div>
                                            <div>Used: {template.usageCount} times</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => onCreateFromTemplate(template)}
                                            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', background: '#007bff', color: 'white', cursor: 'pointer', borderRadius: '4px' }}
                                        >
                                            📋 Use Template
                                        </button>
                                        <button
                                            onClick={() => handleExportTemplate(template)}
                                            style={{ padding: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                        >
                                            📥
                                        </button>
                                        {!template.isBuiltIn && (
                                            <button
                                                onClick={() => handleDeleteTemplate(template.id)}
                                                style={{ padding: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📋</div>
                            <p style={{ margin: 0, fontSize: '14px' }}>No templates found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
