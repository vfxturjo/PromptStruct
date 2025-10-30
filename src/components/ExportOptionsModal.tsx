import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, FolderOpen, Clock } from 'lucide-react';
import { Project, Prompt, Version } from '@/types';

interface ExportOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (options: ExportOptions) => void;
    exportType: 'prompt' | 'project' | 'workspace';
    project?: Project | null;
    prompt?: Prompt | null;
    versions?: Version[];
}

interface ExportOptions {
    scope: 'current' | 'last' | 'all';
    format: 'json';
    includeMetadata: boolean;
}

export function ExportOptionsModal({
    isOpen,
    onClose,
    onExport,
    exportType,
    project,
    prompt,
    versions = []
}: ExportOptionsModalProps) {
    const [options, setOptions] = useState<ExportOptions>({
        scope: 'current',
        format: 'json',
        includeMetadata: true
    });

    const handleExport = () => {
        onExport(options);
        onClose();
    };

    const getTitle = () => {
        switch (exportType) {
            case 'prompt':
                return `Export Prompt: ${prompt?.name || 'Untitled'}`;
            case 'project':
                return `Export Project: ${project?.name || 'Untitled'}`;
            case 'workspace':
                return 'Export Workspace';
            default:
                return 'Export Options';
        }
    };

    const getDescription = () => {
        switch (exportType) {
            case 'prompt':
                return 'Choose what to include in the prompt export:';
            case 'project':
                return 'Choose what to include in the project export:';
            case 'workspace':
                return 'Export your entire workspace including all projects, prompts, and settings:';
            default:
                return '';
        }
    };

    const getScopeOptions = () => {
        switch (exportType) {
            case 'prompt':
                {
                    // Count non-autosave versions
                    const manualVersions = versions.filter(v => !v.isAutoSave);
                    return [
                        {
                            value: 'current',
                            label: 'Current version only',
                            description: 'Export only the current structure state',
                            icon: <FileText className="w-4 h-4" />
                        },
                        {
                            value: 'last',
                            label: 'Last saved version',
                            description: `Export the most recent manual save (${manualVersions.length} version${manualVersions.length !== 1 ? 's' : ''} available)`,
                            icon: <Clock className="w-4 h-4" />
                        },
                        {
                            value: 'all',
                            label: 'All versions',
                            description: `Export all ${manualVersions.length} manual versions (autosaves excluded)`,
                            icon: <FileText className="w-4 h-4" />
                        }
                    ];
                }
            case 'project':
                return [
                    {
                        value: 'current',
                        label: 'Project metadata only',
                        description: 'Export project information without prompts',
                        icon: <FolderOpen className="w-4 h-4" />
                    },
                    {
                        value: 'last',
                        label: 'Project with last version of each prompt',
                        description: 'Export project with the most recent manual save of each prompt',
                        icon: <Clock className="w-4 h-4" />
                    },
                    {
                        value: 'all',
                        label: 'Project with all versions',
                        description: 'Export project with all manual versions (autosaves excluded)',
                        icon: <FolderOpen className="w-4 h-4" />
                    }
                ];
            case 'workspace':
                return [
                    {
                        value: 'all',
                        label: 'Complete workspace',
                        description: 'Export everything including UI state and settings',
                        icon: <Download className="w-4 h-4" />
                    }
                ];
            default:
                return [];
        }
    };

    const scopeOptions = getScopeOptions();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        {getTitle()}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                        {getDescription()}
                    </p>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Export Scope</Label>
                        <RadioGroup
                            value={options.scope}
                            onValueChange={(value: string) => setOptions(prev => ({ ...prev, scope: value as 'current' | 'last' | 'all' }))}
                        >
                            {scopeOptions.map((option) => (
                                <div key={option.value} className="flex items-start space-x-3">
                                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer">
                                            {option.icon}
                                            <span className="font-medium">{option.label}</span>
                                        </Label>
                                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                                            {option.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {exportType === 'workspace' && (
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        id="include-metadata"
                                        checked={options.includeMetadata}
                                        onChange={(e) => setOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                                        className="rounded"
                                    />
                                    <Label htmlFor="include-metadata" className="cursor-pointer">
                                        Include UI state and settings
                                    </Label>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 ml-6">
                                    Preserve panel layouts, collapsed states, and other UI preferences
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
