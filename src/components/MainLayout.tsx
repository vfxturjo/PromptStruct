import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { StructuralElementCard } from './StructuralElementCard';
import { useEditorStore } from '@/stores/editorStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StructuralElement } from '@/types';
import { Plus, ArrowLeft, Save, Download, Copy, ChevronRight, HelpCircle } from 'lucide-react';
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
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="border-b p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/browser')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Browser
                        </Button>
                        <div>
                            <Typography variant="h1">
                                Project Gemini
                            </Typography>
                            {currentProject && currentPrompt && (
                                <Typography variant="muted">
                                    {currentProject.name} → {currentPrompt.name}
                                </Typography>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button
                            variant={previewMode === 'clean' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode('clean')}
                        >
                            Clean
                        </Button>
                        <Button
                            variant={previewMode === 'raw' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode('raw')}
                        >
                            Raw
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex">
                <PanelGroup direction="horizontal" className="h-full">
                    {/* Structure Panel */}
                    <Panel defaultSize={30} minSize={20} maxSize={50}>
                        <div className="h-full border-r p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Structure
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext items={structure.map(el => el.id)} strategy={verticalListSortingStrategy}>
                                            <div>
                                                {structure.length === 0 ? (
                                                    <Typography variant="muted">
                                                        No structural elements yet. Add one to get started.
                                                    </Typography>
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
                                    <Button className="w-full mt-4" variant="outline" onClick={handleAddElement}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Element
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-2" />

                    {/* Preview Panel */}
                    <Panel defaultSize={helpPanelExpanded ? 50 : 70} minSize={30}>
                        <div className="h-full p-4">
                            <Card className="h-full flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <Typography variant="p" className="whitespace-pre-wrap">
                                        {structure.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="text-4xl mb-4">✨</div>
                                                <Typography variant="p">Your rendered prompt will appear here...</Typography>
                                                <Typography variant="small" className="mt-2">Add some elements to get started</Typography>
                                            </div>
                                        ) : (
                                            renderPreview()
                                        )}
                                    </Typography>
                                </CardContent>
                                <div className="p-4 border-t">
                                    <Button
                                        className="w-full"
                                        onClick={handleCopyPrompt}
                                        disabled={structure.length === 0}
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Prompt
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </Panel>

                    {/* Help Panel */}
                    {helpPanelExpanded && (
                        <>
                            <PanelResizeHandle className="w-2" />
                            <Panel defaultSize={20} minSize={15} maxSize={40}>
                                <div className="h-full border-l p-4">
                                    <Card className="h-full">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                Help
                                            </CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setHelpPanelExpanded(false)}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <Typography variant="h4" className="mb-2">📝 Edit Elements</Typography>
                                                <Typography variant="muted">
                                                    Click on any element in the left panel to edit its content.
                                                </Typography>
                                            </div>

                                            <div>
                                                <Typography variant="h4" className="mb-2">🎛️ Control Syntax</Typography>
                                                <div>
                                                    <div>
                                                        <Typography variant="inlineCode">{'{{text:Name:Default}}'}</Typography>
                                                        <Typography variant="muted" className="ml-1">→ Text input</Typography>
                                                    </div>
                                                    <div>
                                                        <Typography variant="inlineCode">{'{{select:Name:Option1|Option2}}'}</Typography>
                                                        <Typography variant="muted" className="ml-1">→ Dropdown</Typography>
                                                    </div>
                                                    <div>
                                                        <Typography variant="inlineCode">{'{{slider:Name:50}}'}</Typography>
                                                        <Typography variant="muted" className="ml-1">→ Slider</Typography>
                                                    </div>
                                                    <div>
                                                        <Typography variant="inlineCode">{'{{toggle:Name}}...{{/toggle:Name}}'}</Typography>
                                                        <Typography variant="muted" className="ml-1">→ Toggle block</Typography>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <Typography variant="h4" className="mb-2">⌨️ Shortcuts</Typography>
                                                <div>
                                                    <div><Typography variant="inlineCode">Ctrl+N</Typography> Add element</div>
                                                    <div><Typography variant="inlineCode">Ctrl+S</Typography> Save</div>
                                                    <div><Typography variant="inlineCode">Ctrl+C</Typography> Copy prompt</div>
                                                    <div><Typography variant="inlineCode">Escape</Typography> Back to browser</div>
                                                </div>
                                            </div>

                                            <div>
                                                <Typography variant="h4" className="mb-2">🔄 Preview Modes</Typography>
                                                <div>
                                                    <div><Typography variant="large">Clean:</Typography> Final prompt with values</div>
                                                    <div><Typography variant="large">Raw:</Typography> Prompt with {'{{...}}'} syntax</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </Panel>
                        </>
                    )}
                </PanelGroup>

                {/* Help Panel Toggle (when collapsed) */}
                {!helpPanelExpanded && (
                    <div className="absolute right-4 top-1/2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setHelpPanelExpanded(true)}
                        >
                            <HelpCircle className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}