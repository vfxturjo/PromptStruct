import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Import, FolderOpen, FileText, AlertTriangle } from 'lucide-react';
import { ImportAnalysis, ImportConflict } from '@/types';

interface ImportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (resolutions: ImportConflict[]) => void;
    importAnalysis: ImportAnalysis;
}

export function ImportPreviewModal({
    isOpen,
    onClose,
    onConfirm,
    importAnalysis
}: ImportPreviewModalProps) {
    const [resolutions, setResolutions] = useState<ImportConflict[]>(importAnalysis.conflicts);
    const [applyToAll, setApplyToAll] = useState(false);
    const [globalResolution, setGlobalResolution] = useState<'overwrite' | 'skip' | 'duplicate'>('overwrite');

    const getTypeLabel = () => {
        switch (importAnalysis.type) {
            case 'prompt':
                return 'Single Prompt';
            case 'project':
                return 'Single Project';
            case 'workspace':
                return 'Full Workspace';
            case 'bulk-prompts':
                return 'Multiple Prompts';
            case 'bulk-projects':
                return 'Multiple Projects';
            default:
                return 'Unknown';
        }
    };

    const getTypeIcon = () => {
        switch (importAnalysis.type) {
            case 'project':
            case 'bulk-projects':
                return <FolderOpen className="w-5 h-5" />;
            case 'workspace':
                return <Import className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    const handleResolutionChange = (id: string, resolution: 'overwrite' | 'skip' | 'duplicate') => {
        setResolutions(prev => prev.map(r => r.id === id ? { ...r, resolution } : r));
    };

    const handleApplyToAll = () => {
        setResolutions(prev => prev.map(r => ({ ...r, resolution: globalResolution })));
    };

    const handleConfirm = () => {
        onConfirm(resolutions);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getTypeIcon()}
                        Import Preview - {getTypeLabel()}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-2">
                        <Card>
                            <CardContent className="p-3 text-center">
                                <div className="text-2xl font-bold">{importAnalysis.projects.length}</div>
                                <div className="text-xs text-muted-foreground">Project{importAnalysis.projects.length !== 1 ? 's' : ''}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3 text-center">
                                <div className="text-2xl font-bold">{importAnalysis.prompts.length}</div>
                                <div className="text-xs text-muted-foreground">Prompt{importAnalysis.prompts.length !== 1 ? 's' : ''}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3 text-center">
                                <div className="text-2xl font-bold">{importAnalysis.versions.length}</div>
                                <div className="text-xs text-muted-foreground">Version{importAnalysis.versions.length !== 1 ? 's' : ''}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Items List */}
                    <div>
                        <Label className="text-sm font-medium mb-2">Contents:</Label>
                        <ScrollArea className="h-32 border rounded-md p-2">
                            <div className="space-y-1">
                                {importAnalysis.projects.map(project => (
                                    <div key={project.id} className="flex items-center gap-2 text-sm">
                                        <FolderOpen className="w-4 h-4 text-muted-foreground" />
                                        <span>{project.name}</span>
                                        {importAnalysis.conflicts.some(c => c.id === project.id) && (
                                            <Badge variant="destructive" className="ml-auto">
                                                <AlertTriangle className="w-3 h-3 mr-1" />
                                                Conflict
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                                {importAnalysis.prompts.map(prompt => (
                                    <div key={prompt.id} className="flex items-center gap-2 text-sm">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        <span>{prompt.name}</span>
                                        {importAnalysis.conflicts.some(c => c.id === prompt.id) && (
                                            <Badge variant="destructive" className="ml-auto">
                                                <AlertTriangle className="w-3 h-3 mr-1" />
                                                Conflict
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Conflicts Resolution */}
                    {resolutions.length > 0 && (
                        <div>
                            <Label className="text-sm font-medium mb-2">
                                Conflicts Detected ({resolutions.length})
                            </Label>

                            {/* Apply to all */}
                            <Card className="mb-3">
                                <CardContent className="p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="apply-to-all"
                                                checked={applyToAll}
                                                onChange={(e) => setApplyToAll(e.target.checked)}
                                                className="rounded"
                                            />
                                            <Label htmlFor="apply-to-all" className="cursor-pointer text-sm">
                                                Apply to all conflicts:
                                            </Label>
                                        </div>
                                        <RadioGroup
                                            value={globalResolution}
                                            onValueChange={(value) => {
                                                setGlobalResolution(value as 'overwrite' | 'skip' | 'duplicate');
                                                if (applyToAll) {
                                                    handleApplyToAll();
                                                }
                                            }}
                                            className="flex flex-row gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="overwrite" id="global-overwrite" />
                                                <Label htmlFor="global-overwrite" className="cursor-pointer text-xs">Overwrite</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="skip" id="global-skip" />
                                                <Label htmlFor="global-skip" className="cursor-pointer text-xs">Skip</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="duplicate" id="global-duplicate" />
                                                <Label htmlFor="global-duplicate" className="cursor-pointer text-xs">Duplicate</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Individual conflicts */}
                            <ScrollArea className="h-32 border rounded-md p-2">
                                <div className="space-y-3">
                                    {resolutions.map((conflict) => (
                                        <div key={conflict.id} className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                {conflict.type === 'project' ? (
                                                    <FolderOpen className="w-4 h-4" />
                                                ) : (
                                                    <FileText className="w-4 h-4" />
                                                )}
                                                <span>{conflict.name}</span>
                                                <Badge variant="outline" className="ml-auto text-xs">
                                                    {conflict.type}
                                                </Badge>
                                            </div>
                                            <RadioGroup
                                                value={conflict.resolution}
                                                onValueChange={(value) => handleResolutionChange(conflict.id, value as 'overwrite' | 'skip' | 'duplicate')}
                                                className="grid grid-cols-3 gap-2"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="overwrite" id={`${conflict.id}-overwrite`} />
                                                    <Label htmlFor={`${conflict.id}-overwrite`} className="cursor-pointer text-xs">Keep Existing</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="skip" id={`${conflict.id}-skip`} />
                                                    <Label htmlFor={`${conflict.id}-skip`} className="cursor-pointer text-xs">Skip</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="duplicate" id={`${conflict.id}-duplicate`} />
                                                    <Label htmlFor={`${conflict.id}-duplicate`} className="cursor-pointer text-xs">Create Copy</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {resolutions.length === 0 && (
                        <Card>
                            <CardContent className="p-3 text-center text-sm text-muted-foreground">
                                No conflicts detected. All items will be imported.
                            </CardContent>
                        </Card>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm}>
                        <Import className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

