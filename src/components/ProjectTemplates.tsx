import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, Download, Trash2, Star, ChevronDown, ChevronUp } from 'lucide-react';

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

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Project Templates
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Search and Filters */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(category => (
                                    <SelectItem key={category} value={category}>
                                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Create Template Form */}
                    <Collapsible open={showCreateForm} onOpenChange={setShowCreateForm}>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full">
                                {showCreateForm ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                                {showCreateForm ? 'Hide Create Form' : 'Create New Template'}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4">
                            <Card>
                                <CardHeader>
                                    <h4 className="text-lg font-semibold">Create New Template</h4>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="template-name">Template Name</Label>
                                            <Input
                                                id="template-name"
                                                type="text"
                                                value={newTemplate.name || ''}
                                                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Enter template name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="template-category">Category</Label>
                                            <Select
                                                value={newTemplate.category || 'general'}
                                                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="general">General</SelectItem>
                                                    <SelectItem value="writing">Writing</SelectItem>
                                                    <SelectItem value="business">Business</SelectItem>
                                                    <SelectItem value="development">Development</SelectItem>
                                                    <SelectItem value="education">Education</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="template-description">Description</Label>
                                        <Textarea
                                            id="template-description"
                                            value={newTemplate.description || ''}
                                            onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Describe what this template is for..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleCreateTemplate}>
                                            Create Template
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Templates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map(template => (
                            <Card key={template.id} className="relative">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold flex items-center gap-2">
                                                {template.name}
                                                {template.isBuiltIn && (
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                )}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {template.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        <Badge variant="secondary" className="text-xs">
                                            {template.category}
                                        </Badge>
                                        {template.tags.slice(0, 2).map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {template.tags.length > 2 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{template.tags.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <div>Prompts: {template.prompts.length}</div>
                                        <div>Used: {template.usageCount} times</div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                    <Button
                                        onClick={() => onCreateFromTemplate(template)}
                                        className="flex-1"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Use Template
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleExportTemplate(template)}
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>
                                    {!template.isBuiltIn && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteTemplate(template.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                            <p className="text-muted-foreground">No templates match your search criteria.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
