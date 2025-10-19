import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ControlPanel } from './ControlPanel';
import { StructuralElement } from '@/types';
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
        <div ref={setNodeRef} style={{ ...style, marginBottom: '16px' }}>
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                opacity: !element.enabled ? 0.5 : 1
            }}>
                <div style={{ padding: '12px', borderBottom: '1px solid #ccc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            {...attributes}
                            {...listeners}
                            style={{ cursor: 'grab', padding: '4px' }}
                        >
                            ⋮⋮
                        </div>
                        <input
                            type="text"
                            value={element.name}
                            onChange={(e) => onUpdate(element.id, { name: e.target.value })}
                            placeholder="Element name..."
                            style={{
                                flex: 1,
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        />
                        <button
                            onClick={() => onToggle(element.id)}
                            style={{
                                padding: '6px 12px',
                                border: '1px solid #ccc',
                                background: element.enabled ? '#007bff' : 'white',
                                color: element.enabled ? 'white' : 'black',
                                cursor: 'pointer',
                                borderRadius: '4px'
                            }}
                        >
                            {element.enabled ? 'On' : 'Off'}
                        </button>
                        <button
                            onClick={() => onDelete(element.id)}
                            style={{
                                padding: '6px 12px',
                                border: '1px solid #ccc',
                                background: 'white',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                color: '#dc3545'
                            }}
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                <div style={{ padding: '16px' }}>
                    <textarea
                        value={element.content}
                        onChange={(e) => onUpdate(element.id, { content: e.target.value })}
                        placeholder="Enter your prompt content here..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            resize: 'vertical'
                        }}
                    />
                    <ControlPanel
                        content={element.content}
                        controlValues={controlValues}
                        onControlChange={handleControlChange}
                    />
                </div>
            </div>
        </div>
    );
}
