import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ControlPanel } from './ControlPanel';
import { EnhancedTextarea } from './EnhancedTextarea';
import { StructuralElement } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GripVertical, Trash2, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface StructuralElementCardProps {
    element: StructuralElement;
    onUpdate: (id: string, updates: Partial<StructuralElement>) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
    controlValues: Record<string, any>;
    onControlChange: (name: string, value: any) => void;
}

export function StructuralElementCard({
    element,
    onUpdate,
    onDelete,
    onToggle,
    controlValues,
    onControlChange
}: StructuralElementCardProps) {
    const [isTextExpanded, setIsTextExpanded] = useState(true);
    const [isControlsExpanded, setIsControlsExpanded] = useState(true);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: element.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };


    return (
        <div ref={setNodeRef} style={style} className="mb-2">
            <Card className={`transition-opacity ${!element.enabled ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab p-1 hover:bg-accent rounded"
                        >
                            <GripVertical className="w-4 h-4" />
                        </div>
                        <Input
                            type="text"
                            value={element.name}
                            onChange={(e) => onUpdate(element.id, { name: e.target.value })}
                            placeholder="Element name..."
                            className="flex-1 font-semibold"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsTextExpanded(!isTextExpanded)}
                            className="text-muted-foreground hover:text-foreground"
                            title={isTextExpanded ? "Hide text area" : "Show text area"}
                        >
                            {isTextExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsControlsExpanded(!isControlsExpanded)}
                            className="text-muted-foreground hover:text-foreground"
                            title={isControlsExpanded ? "Hide dynamic controls" : "Show dynamic controls"}
                        >
                            {isControlsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                        <Switch
                            checked={element.enabled}
                            onCheckedChange={() => onToggle(element.id)}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(element.id)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Collapsible open={isTextExpanded} onOpenChange={setIsTextExpanded}>
                        <CollapsibleContent>
                            <EnhancedTextarea
                                value={element.content}
                                onChange={(e) => onUpdate(element.id, { content: e.target.value })}
                                placeholder="Enter your prompt content here..."
                                className="min-h-[100px] font-mono text-sm resize-y mb-2"
                            />
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible open={isControlsExpanded} onOpenChange={setIsControlsExpanded}>
                        <CollapsibleContent>
                            <ControlPanel
                                content={element.content}
                                controlValues={controlValues}
                                onControlChange={onControlChange}
                            />
                        </CollapsibleContent>
                    </Collapsible>
                </CardContent>
            </Card>
        </div>
    );
}
