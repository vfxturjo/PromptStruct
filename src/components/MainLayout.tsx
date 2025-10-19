import { StructuralElementCard } from './StructuralElementCard';
import { useEditorStore } from '@/stores/editorStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StructuralElement } from '@/types';
import { useState, useEffect } from 'react';
import { renderPrompt, parseControlSyntax } from '@/utils/syntaxParser';
import { useNavigate } from 'react-router-dom';
import { NotificationService } from '@/services/notificationService';
import { useKeyboardShortcuts, CommonShortcuts } from '@/services/keyboardShortcuts';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

export function MainLayout() {
    const {
        structure,
        previewMode,
        setPreviewMode,
        updateStructuralElement,
        addStructuralElement,
        removeStructuralElement,
        toggleStructuralElement,
        updateStructure,
        currentProject,
        currentPrompt,
        saveCurrentPrompt
    } = useEditorStore();

    const navigate = useNavigate();
    const [controlValues] = useState<Record<string, any>>({});
    const [helpPanelExpanded, setHelpPanelExpanded] = useState(true);

    const handleSave = () => {
        try {
            saveCurrentPrompt();
            NotificationService.promptSaved(currentPrompt?.name || 'Untitled');
        } catch (error) {
            NotificationService.saveError(`Save failed: ${error}`);
        }
    };

    const handleCopyPrompt = () => {
        const renderedPrompt = renderPreview();
        navigator.clipboard.writeText(renderedPrompt).then(() => {
            NotificationService.success('Prompt copied to clipboard!');
        }).catch(() => {
            NotificationService.error('Failed to copy prompt');
        });
    };

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            ...CommonShortcuts.SAVE,
            action: handleSave
        },
        {
            ...CommonShortcuts.NEW_PROMPT,
            action: () => {
                addStructuralElement({
                    name: 'New Element',
                    enabled: true,
                    content: 'Enter your content here...'
                });
            }
        },
        {
            key: 'c',
            ctrlKey: true,
            action: handleCopyPrompt,
            description: 'Copy prompt to clipboard'
        },
        {
            key: 'Escape',
            action: () => navigate('/browser'),
            description: 'Go back to browser'
        }
    ]);

    // Auto-save functionality
    useEffect(() => {
        if (!currentPrompt) return;

        const autoSaveInterval = setInterval(() => {
            try {
                saveCurrentPrompt();
                NotificationService.autoSaveSuccess();
            } catch (error) {
                NotificationService.saveError(`Auto-save failed: ${error}`);
            }
        }, 30000); // Auto-save every 30 seconds

        return () => clearInterval(autoSaveInterval);
    }, [currentPrompt, structure, saveCurrentPrompt]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = structure.findIndex((item) => item.id === active.id);
            const newIndex = structure.findIndex((item) => item.id === over.id);

            updateStructure(arrayMove(structure, oldIndex, newIndex));
        }
    };

    const handleAddElement = () => {
        const newElement: StructuralElement = {
            id: `element_${Date.now()}`,
            name: 'New Element',
            enabled: true,
            content: 'Enter your prompt content here...'
        };
        addStructuralElement(newElement);
    };

    const renderPreview = () => {
        const enabledElements = structure.filter(el => el.enabled);
        const renderedContent = enabledElements.map(element => {
            const controls = parseControlSyntax(element.content);
            return renderPrompt(element.content, controls, controlValues);
        }).join('\n\n');

        return previewMode === 'raw' ?
            enabledElements.map(el => el.content).join('\n\n') :
            renderedContent;
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ borderBottom: '1px solid #ccc', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => navigate('/browser')}
                            style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                        >
                            ← Back to Browser
                        </button>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                                Project Gemini
                            </h1>
                            {currentProject && currentPrompt && (
                                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                                    {currentProject.name} → {currentPrompt.name}
                                </p>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={handleSave}
                            style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                        >
                            💾 Save
                        </button>
                        <button
                            style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                        >
                            📥 Export
                        </button>
                        <button
                            onClick={() => setPreviewMode('clean')}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #ccc',
                                background: previewMode === 'clean' ? '#007bff' : 'white',
                                color: previewMode === 'clean' ? 'white' : 'black',
                                cursor: 'pointer'
                            }}
                        >
                            Clean
                        </button>
                        <button
                            onClick={() => setPreviewMode('raw')}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #ccc',
                                background: previewMode === 'raw' ? '#007bff' : 'white',
                                color: previewMode === 'raw' ? 'white' : 'black',
                                cursor: 'pointer'
                            }}
                        >
                            Raw
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex' }}>
                <PanelGroup direction="horizontal" style={{ height: '100%' }}>
                    {/* Structure Panel */}
                    <Panel defaultSize={30} minSize={20} maxSize={50}>
                        <div style={{ height: '100%', borderRight: '1px solid #ccc', padding: '16px' }}>
                            <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
                                <div style={{ padding: '16px', borderBottom: '1px solid #ccc' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                        Structure
                                    </h3>
                                </div>
                                <div style={{ padding: '16px' }}>
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext items={structure.map(el => el.id)} strategy={verticalListSortingStrategy}>
                                            <div>
                                                {structure.length === 0 ? (
                                                    <p style={{ color: '#666', margin: 0 }}>
                                                        No structural elements yet. Add one to get started.
                                                    </p>
                                                ) : (
                                                    structure.map((element) => (
                                                        <StructuralElementCard
                                                            key={element.id}
                                                            element={element}
                                                            onUpdate={updateStructuralElement}
                                                            onDelete={removeStructuralElement}
                                                            onToggle={toggleStructuralElement}
                                                        />
                                                    ))
                                                )}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                    <button
                                        onClick={handleAddElement}
                                        style={{
                                            width: '100%',
                                            marginTop: '16px',
                                            padding: '12px',
                                            border: '1px solid #ccc',
                                            background: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ➕ Add Element
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <PanelResizeHandle style={{ width: '8px', background: '#f0f0f0' }} />

                    {/* Preview Panel */}
                    <Panel defaultSize={helpPanelExpanded ? 50 : 70} minSize={30}>
                        <div style={{ height: '100%', padding: '16px' }}>
                            <div style={{ height: '100%', border: '1px solid #ccc', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '16px', borderBottom: '1px solid #ccc' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                        Preview
                                    </h3>
                                </div>
                                <div style={{ flex: 1, padding: '16px' }}>
                                    <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                        {structure.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '32px' }}>
                                                <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
                                                <p>Your rendered prompt will appear here...</p>
                                                <small style={{ color: '#666' }}>Add some elements to get started</small>
                                            </div>
                                        ) : (
                                            renderPreview()
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: '16px', borderTop: '1px solid #ccc' }}>
                                    <button
                                        onClick={handleCopyPrompt}
                                        disabled={structure.length === 0}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ccc',
                                            background: structure.length === 0 ? '#f5f5f5' : 'white',
                                            cursor: structure.length === 0 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        📋 Copy Prompt
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    {/* Help Panel */}
                    {helpPanelExpanded && (
                        <>
                            <PanelResizeHandle style={{ width: '8px', background: '#f0f0f0' }} />
                            <Panel defaultSize={20} minSize={15} maxSize={40}>
                                <div style={{ height: '100%', borderLeft: '1px solid #ccc', padding: '16px' }}>
                                    <div style={{ height: '100%', border: '1px solid #ccc', borderRadius: '4px' }}>
                                        <div style={{ padding: '16px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                                Help
                                            </h3>
                                            <button
                                                onClick={() => setHelpPanelExpanded(false)}
                                                style={{ padding: '4px 8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                            >
                                                →
                                            </button>
                                        </div>
                                        <div style={{ padding: '16px' }}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>📝 Edit Elements</h4>
                                                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                                                    Click on any element in the left panel to edit its content.
                                                </p>
                                            </div>

                                            <div style={{ marginBottom: '16px' }}>
                                                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>🎛️ Control Syntax</h4>
                                                <div>
                                                    <div style={{ marginBottom: '4px' }}>
                                                        <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>{'{{text:Name:Default}}'}</code>
                                                        <span style={{ color: '#666', marginLeft: '4px' }}>→ Text input</span>
                                                    </div>
                                                    <div style={{ marginBottom: '4px' }}>
                                                        <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>{'{{select:Name:Option1|Option2}}'}</code>
                                                        <span style={{ color: '#666', marginLeft: '4px' }}>→ Dropdown</span>
                                                    </div>
                                                    <div style={{ marginBottom: '4px' }}>
                                                        <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>{'{{slider:Name:50}}'}</code>
                                                        <span style={{ color: '#666', marginLeft: '4px' }}>→ Slider</span>
                                                    </div>
                                                    <div style={{ marginBottom: '4px' }}>
                                                        <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>{'{{toggle:Name}}...{{/toggle:Name}}'}</code>
                                                        <span style={{ color: '#666', marginLeft: '4px' }}>→ Toggle block</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '16px' }}>
                                                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>⌨️ Shortcuts</h4>
                                                <div>
                                                    <div><code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>Ctrl+N</code> Add element</div>
                                                    <div><code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>Ctrl+S</code> Save</div>
                                                    <div><code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>Ctrl+C</code> Copy prompt</div>
                                                    <div><code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>Escape</code> Back to browser</div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>🔄 Preview Modes</h4>
                                                <div>
                                                    <div><strong>Clean:</strong> Final prompt with values</div>
                                                    <div><strong>Raw:</strong> Prompt with {'{{...}}'} syntax</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        </>
                    )}
                </PanelGroup>

                {/* Help Panel Toggle (when collapsed) */}
                {!helpPanelExpanded && (
                    <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }}>
                        <button
                            onClick={() => setHelpPanelExpanded(true)}
                            style={{ padding: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                        >
                            ❓
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}