import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm px-6 py-4 flex-shrink-0">
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
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Project Gemini
                            </h1>
                            {currentProject && currentPrompt && (
                                <p className="text-sm text-muted-foreground">
                                    {currentProject.name} → {currentPrompt.name}
                                </p>
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
            <div className="flex-1 flex overflow-hidden relative min-h-0">
                <PanelGroup direction="horizontal" className="h-full">
                    {/* Structure Panel */}
                    <Panel defaultSize={30} minSize={20} maxSize={50}>
                        <div className="h-full border-r bg-muted/30 p-4 overflow-y-auto overflow-x-hidden">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        Structure
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext items={structure.map(el => el.id)} strategy={verticalListSortingStrategy}>
                                            <div className="space-y-2">
                                                {structure.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">
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
                                    <Button className="w-full mt-4" variant="outline" onClick={handleAddElement}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Element
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-2 bg-border hover:bg-border/80 transition-colors" />

                    {/* Preview Panel */}
                    <Panel defaultSize={helpPanelExpanded ? 50 : 70} minSize={30}>
                        <div className="h-full p-4 overflow-hidden">
                            <Card className="h-full flex flex-col">
                                <CardHeader className="flex-shrink-0">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {structure.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <div className="text-4xl mb-4">✨</div>
                                                <p>Your rendered prompt will appear here...</p>
                                                <p className="text-xs mt-2">Add some elements to get started</p>
                                            </div>
                                        ) : (
                                            renderPreview()
                                        )}
                                    </div>
                                </CardContent>
                                <div className="p-4 border-t flex-shrink-0">
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
                            <PanelResizeHandle className="w-2 bg-border hover:bg-border/80 transition-colors" />
                            <Panel defaultSize={20} minSize={15} maxSize={40}>
                                <div className="h-full border-l bg-muted/30 p-4 overflow-y-auto overflow-x-hidden">
                                    <Card className="h-full">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
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
                                        <CardContent className="space-y-4 text-xs">
                                            <div>
                                                <h4 className="font-medium mb-2">📝 Edit Elements</h4>
                                                <p className="text-muted-foreground">
                                                    Click on any element in the left panel to edit its content.
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="font-medium mb-2">🎛️ Control Syntax</h4>
                                                <div className="space-y-2">
                                                    <div>
                                                        <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{text:Name:Default}}'}</code>
                                                        <span className="text-muted-foreground ml-1">→ Text input</span>
                                                    </div>
                                                    <div>
                                                        <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{select:Name:Option1|Option2}}'}</code>
                                                        <span className="text-muted-foreground ml-1">→ Dropdown</span>
                                                    </div>
                                                    <div>
                                                        <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{slider:Name:50}}'}</code>
                                                        <span className="text-muted-foreground ml-1">→ Slider</span>
                                                    </div>
                                                    <div>
                                                        <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{toggle:Name}}...{{/toggle:Name}}'}</code>
                                                        <span className="text-muted-foreground ml-1">→ Toggle block</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-medium mb-2">⌨️ Shortcuts</h4>
                                                <div className="space-y-1">
                                                    <div><kbd className="bg-muted px-1 rounded text-xs">Ctrl+N</kbd> Add element</div>
                                                    <div><kbd className="bg-muted px-1 rounded text-xs">Ctrl+S</kbd> Save</div>
                                                    <div><kbd className="bg-muted px-1 rounded text-xs">Ctrl+C</kbd> Copy prompt</div>
                                                    <div><kbd className="bg-muted px-1 rounded text-xs">Escape</kbd> Back to browser</div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-medium mb-2">🔄 Preview Modes</h4>
                                                <div className="space-y-1">
                                                    <div><strong>Clean:</strong> Final prompt with values</div>
                                                    <div><strong>Raw:</strong> Prompt with {'{{...}}'} syntax</div>
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
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setHelpPanelExpanded(true)}
                            className="shadow-lg"
                        >
                            <HelpCircle className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}