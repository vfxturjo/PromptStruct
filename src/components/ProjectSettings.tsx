import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Typography } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/stores/editorStore';
import { NotificationService } from '@/services/notificationService';
import { X, Plus, Save, Settings } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Project Settings
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <Typography variant="h3" className="text-lg font-medium">Basic Information</Typography>

                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project Name</Label>
                            <Input
                                id="project-name"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Enter project name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="project-description">Description</Label>
                            <Textarea
                                id="project-description"
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                placeholder="Describe what this project is about..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Add a tag"
                                />
                                <Button onClick={handleAddTag} size="sm">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {projectTags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                        {tag}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                            onClick={() => handleRemoveTag(tag)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Default Template */}
                    <div className="space-y-4">
                        <Typography variant="h3" className="text-lg font-medium">Default Prompt Template</Typography>
                        <div className="space-y-2">
                            <Label htmlFor="default-template">Template Content</Label>
                            <Textarea
                                id="default-template"
                                value={defaultPromptTemplate}
                                onChange={(e) => setDefaultPromptTemplate(e.target.value)}
                                placeholder="Enter default template for new prompts..."
                                rows={4}
                            />
                            <Typography variant="muted">
                                This template will be used when creating new prompts in this project.
                            </Typography>
                        </div>
                    </div>

                    <Separator />

                    {/* Settings */}
                    <div className="space-y-4">
                        <Typography variant="h3" className="text-lg font-medium">Project Settings</Typography>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>Auto-save</Label>
                                    <Typography variant="muted">
                                        Automatically save changes to prompts
                                    </Typography>
                                </div>
                                <Switch
                                    checked={autoSaveEnabled}
                                    onCheckedChange={setAutoSaveEnabled}
                                />
                            </div>

                            {autoSaveEnabled && (
                                <div className="space-y-2">
                                    <Label htmlFor="auto-save-interval">Auto-save Interval (seconds)</Label>
                                    <Input
                                        id="auto-save-interval"
                                        type="number"
                                        min="10"
                                        max="300"
                                        value={autoSaveInterval}
                                        onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="export-format">Default Export Format</Label>
                                <select
                                    id="export-format"
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'markdown' | 'txt')}
                                    className="w-full p-2 border rounded-md bg-background"
                                >
                                    <option value="json">JSON</option>
                                    <option value="markdown">Markdown</option>
                                    <option value="txt">Plain Text</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
