import { StructuralElementCard } from './StructuralElementCard';
import { useEditorStore } from '@/stores/editorStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StructuralElement } from '@/types';
import { useEffect } from 'react';
import { renderPrompt, parseControlSyntax } from '@/utils/syntaxParser';
import { useNavigate } from 'react-router-dom';
import { NotificationService } from '@/services/notificationService';
import { useKeyboardShortcuts, CommonShortcuts } from '@/services/keyboardShortcuts';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';
import { ArrowLeft, Save, Download, Copy, HelpCircle, ChevronRight, Plus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

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
        saveCurrentPrompt,
        uiCollapsedByElementId,
        uiHelpPanelExpanded,
        uiGlobalControlValues,
        setUiCollapsedForElement,
        setUiHelpPanelExpanded,
        setUiGlobalControlValues,
        projects,
        prompts,
        versions,
        uiPanelLayout
    } = useEditorStore();

    const navigate = useNavigate();

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

    const handleExport = () => {
        try {
            const exportData = {
                projects,
                prompts,
                versions,
                uiState: {
                    previewMode,
                    currentProjectId: currentProject?.id || null,
                    currentPromptId: currentPrompt?.id || null,
                    helpPanelExpanded: uiHelpPanelExpanded,
                    panelLayout: uiPanelLayout,
                    collapsedByElementId: uiCollapsedByElementId,
                    globalControlValues: uiGlobalControlValues
                }
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'prompt-workspace.json';
            link.click();
            URL.revokeObjectURL(url);

            NotificationService.success('Workspace exported successfully!');
        } catch (error) {
            NotificationService.error(`Export failed: ${error}`);
        }
    };

    const handleGlobalControlChange = (name: string, value: any) => {
        setUiGlobalControlValues({ ...uiGlobalControlValues, [name]: value });
    };

    const renderPreview = () => {
        const enabledElements = structure.filter(el => el.enabled);
        const renderedContent = enabledElements.map(element => {
            const controls = parseControlSyntax(element.content);
            return renderPrompt(element.content, controls, uiGlobalControlValues);
        }).join('\n\n');

        return previewMode === 'raw' ?
            enabledElements.map(el => el.content).join('\n\n') :
            renderedContent;
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
            {/* Header */}
            <header className="border-b spacing-header flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => navigate('/browser')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Browser
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                Project Gemini
                            </h1>
                            {currentProject && currentPrompt && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {currentProject.name} → {currentPrompt.name}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal" className="h-full">
                    {/* Structure Panel */}
                    <Panel defaultSize={30} minSize={20} maxSize={50}>
                        <div className="h-full border-r panel-padding flex flex-col">
                            <Card className="h-full flex flex-col dark:bg-neutral-900">
                                <CardHeader className="flex-shrink-0">
                                    <h3 className="text-lg font-bold title-spacing">
                                        Structure
                                    </h3>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext items={structure.map(el => el.id)} strategy={verticalListSortingStrategy}>
                                            <div className="structure-gap">
                                                {structure.length === 0 ? (
                                                    <p className="text-muted-foreground text-sm">
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
                                                            controlValues={uiGlobalControlValues}
                                                            onControlChange={handleGlobalControlChange}
                                                            collapsed={uiCollapsedByElementId[element.id] || { text: true, controls: true }}
                                                            onCollapsedChange={(collapsed) => setUiCollapsedForElement(element.id, collapsed)}
                                                        />
                                                    ))
                                                )}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </CardContent>
                                <CardFooter className="flex-shrink-0">
                                    <Button
                                        onClick={handleAddElement}
                                        className="w-full"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Element
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-2 bg-border" />

                    {/* Preview Panel */}
                    <Panel defaultSize={uiHelpPanelExpanded ? 50 : 70} minSize={30}>
                        <div className="h-full panel-padding flex flex-col">
                            <Card className="h-full flex flex-col dark:bg-neutral-900">
                                <CardHeader className="flex-shrink-0 flex items-center justify-between">
                                    <h3 className="text-lg font-bold title-spacing">
                                        Preview
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => setPreviewMode('clean')}
                                            variant={previewMode === 'clean' ? 'default' : 'outline'}
                                        >
                                            Clean
                                        </Button>
                                        <Button
                                            onClick={() => setPreviewMode('raw')}
                                            variant={previewMode === 'raw' ? 'default' : 'outline'}
                                        >
                                            Raw
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto">
                                    <div className="whitespace-pre-wrap font-mono text-sm">
                                        {structure.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="text-4xl mb-4">✨</div>
                                                <p>Your rendered prompt will appear here...</p>
                                                <small className="text-muted-foreground">Add some elements to get started</small>
                                            </div>
                                        ) : (
                                            renderPreview()
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex-shrink-0">
                                    <Button
                                        onClick={handleCopyPrompt}
                                        disabled={structure.length === 0}
                                        className="w-full"
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy Prompt
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </Panel>

                    {/* Help Panel */}
                    {uiHelpPanelExpanded && (
                        <>
                            <PanelResizeHandle className="w-2 bg-border" />
                            <Panel defaultSize={20} minSize={15} maxSize={40}>
                                <div className="h-full border-l panel-padding flex flex-col">
                                    <Card className="h-full flex flex-col dark:bg-neutral-900">
                                        <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between">
                                            <h3 className="text-lg font-bold title-spacing">
                                                Help
                                            </h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setUiHelpPanelExpanded(false)}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="flex-1 overflow-y-auto stack-section">
                                            <div>
                                                <h4 className="text-sm font-medium mb-2">📝 Edit Elements</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Click on any element in the left panel to edit its content.
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium mb-2">🎛️ Control Syntax</h4>
                                                <div className="space-y-3">
                                                    <div className="flex flex-col gap-1">
                                                        <Kbd className="w-fit whitespace-nowrap">{'{{text:Name:Default}}'}</Kbd>
                                                        <span className="text-sm text-muted-foreground">→ Text input</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <Kbd className="w-fit whitespace-nowrap">{'{{select:Name:Option1|Option2}}'}</Kbd>
                                                        <span className="text-sm text-muted-foreground">→ Dropdown</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <Kbd className="w-fit whitespace-nowrap">{'{{slider:Name:50}}'}</Kbd>
                                                        <span className="text-sm text-muted-foreground">→ Slider</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <Kbd className="w-fit whitespace-nowrap break-all">{'{{toggle:Name}}...{{/toggle:Name}}'}</Kbd>
                                                        <span className="text-sm text-muted-foreground">→ Toggle block</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                                                    💡 Tip: Type <Kbd className="whitespace-nowrap">Ctrl+{'{'}</Kbd> to quickly start a control placeholder
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium mb-2">⌨️ Shortcuts</h4>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Kbd>Ctrl+N</Kbd>
                                                        <span className="text-sm">Add element</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Kbd>Ctrl+S</Kbd>
                                                        <span className="text-sm">Save</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Kbd>Ctrl+C</Kbd>
                                                        <span className="text-sm">Copy prompt</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Kbd>Escape</Kbd>
                                                        <span className="text-sm">Back to browser</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium mb-2">🔄 Preview Modes</h4>
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
                {!uiHelpPanelExpanded && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUiHelpPanelExpanded(true)}
                        >
                            <HelpCircle className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}