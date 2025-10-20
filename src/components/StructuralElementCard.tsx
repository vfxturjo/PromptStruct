import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ControlPanel } from './ControlPanel';
import { EnhancedTextarea } from './EnhancedTextarea';
import { StructuralElement } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { GripVertical, Trash2, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface StructuralElementCardProps {
    element: StructuralElement;
    onUpdate: (id: string, updates: Partial<StructuralElement>) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
    controlValues: Record<string, any>;
    onControlChange: (name: string, value: any) => void;
    collapsed: { text: boolean; controls: boolean };
    onCollapsedChange: (collapsed: { text: boolean; controls: boolean }) => void;
}

export function StructuralElementCard({
    element,
    onUpdate,
    onDelete,
    onToggle,
    controlValues,
    onControlChange,
    collapsed,
    onCollapsedChange
}: StructuralElementCardProps) {
    const isTextExpanded = !collapsed.text;
    const isControlsExpanded = !collapsed.controls;

    const handleTextToggle = () => {
        onCollapsedChange({ ...collapsed, text: !collapsed.text });
    };

    const handleControlsToggle = () => {
        onCollapsedChange({ ...collapsed, controls: !collapsed.controls });
    };

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
        <div ref={setNodeRef} style={style} className="">
            <Card className={`transition-opacity ${!element.enabled ? 'opacity-50' : ''} dark:bg-neutral-800`}>
                <CardHeader className="card-header-sizing" style={{ minHeight: 'var(--card-header-height)' }}>
                    <div className="card-toolbar">
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
                            onClick={handleTextToggle}
                            className="text-muted-foreground hover:text-foreground"
                            title={isTextExpanded ? "Hide text area" : "Show text area"}
                        >
                            {isTextExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleControlsToggle}
                            className="text-muted-foreground hover:text-foreground"
                            title={isControlsExpanded ? "Hide dynamic controls" : "Show dynamic controls"}
                        >
                            {isControlsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={element.enabled}
                                onCheckedChange={() => onToggle(element.id)}
                                aria-label={element.enabled ? 'On' : 'Off'}
                                id={`toggle-${element.id}`}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(element.id)}
                            className="text-destructive hover:text-destructive"
                            aria-label="trash"
                            title="trash"
                        >
                            <Trash2 className="w-4 h-4" aria-hidden />
                        </Button>
                    </div>
                </CardHeader>
                {(isTextExpanded || isControlsExpanded) && (
                    <CardContent className="card-padding struct-card-content dark:bg-neutral-900">
                        <Collapsible open={isTextExpanded} onOpenChange={(open) => onCollapsedChange({ ...collapsed, text: !open })}>
                            <CollapsibleContent className="collapsible-content">
                                <EnhancedTextarea
                                    value={element.content}
                                    onChange={(e) => onUpdate(element.id, { content: e.target.value })}
                                    placeholder="Enter your prompt content here..."
                                    className="min-h-[80px] font-mono text-sm resize-y dark:bg-neutral-900"
                                />
                            </CollapsibleContent>
                        </Collapsible>

                        <Collapsible open={isControlsExpanded} onOpenChange={(open) => onCollapsedChange({ ...collapsed, controls: !open })}>
                            <CollapsibleContent className="collapsible-content">
                                {(isTextExpanded && isControlsExpanded) && (
                                    <h4 className="text-sm font-medium title-spacing section-vpad">Dynamic Controls</h4>
                                )}
                                <ControlPanel
                                    content={element.content}
                                    controlValues={controlValues}
                                    onControlChange={onControlChange}
                                />
                            </CollapsibleContent>
                        </Collapsible>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
