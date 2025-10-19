import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ControlPanel } from './ControlPanel';
import { StructuralElement } from '@/types';
import { Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface StructuralElementCardProps {
    element: StructuralElement;
    onUpdate: (id: string, updates: Partial<StructuralElement>) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
}

export function StructuralElementCard({
    element,
    onUpdate,
    onDelete,
    onToggle
}: StructuralElementCardProps) {
    const [controlValues, setControlValues] = useState<Record<string, any>>({});

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

    const handleControlChange = (name: string, value: any) => {
        setControlValues(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-4">
            <Card className={`${!element.enabled ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing p-1"
                        >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                            value={element.name}
                            onChange={(e) => onUpdate(element.id, { name: e.target.value })}
                            className="font-medium"
                            placeholder="Element name..."
                        />
                        <Button
                            variant={element.enabled ? "default" : "outline"}
                            size="sm"
                            onClick={() => onToggle(element.id)}
                        >
                            {element.enabled ? 'On' : 'Off'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(element.id)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={element.content}
                        onChange={(e) => onUpdate(element.id, { content: e.target.value })}
                        placeholder="Enter your prompt content here..."
                        className="min-h-[100px] font-mono text-sm"
                        style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                            lineHeight: '1.5'
                        }}
                    />
                    <ControlPanel
                        content={element.content}
                        controlValues={controlValues}
                        onControlChange={handleControlChange}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
