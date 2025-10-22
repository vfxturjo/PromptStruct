import { useEditorStore } from '@/stores/editorStore';
import { parseControlSyntax, renderPrompt } from '@/utils/syntaxParser';
import { MiniStructureEditor } from './MiniStructureEditor';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { NotificationService } from '@/services/notificationService';

export function DirectUsePanel() {
    const { structure, uiGlobalControlValues } = useEditorStore();

    const enabled = structure.filter(el => el.enabled);
    const rendered = enabled.map(element => {
        const controls = parseControlSyntax(element.content);
        return renderPrompt(element.content, controls, uiGlobalControlValues);
    }).join('\n\n');

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(rendered).then(() => {
            NotificationService.success('Prompt copied to clipboard!');
        }).catch(() => {
            NotificationService.error('Failed to copy prompt');
        });
    };

    return (
        <div className="h-full flex flex-col">
            <ResizablePanelGroup direction="vertical" autoSaveId="direct-use-layout">
                {/* Mini Structure Editor */}
                <ResizablePanel defaultSize={40} minSize={20}>
                    <div className="h-full panel-padding flex flex-col">
                        <div className="text-sm text-muted-foreground mb-2 text-center">Mini Structure Editor</div>
                        <div className="flex-1 overflow-auto">
                            <MiniStructureEditor />
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />

                {/* Output Prompt */}
                <ResizablePanel defaultSize={60} minSize={30}>
                    <div className="h-full panel-padding flex flex-col">
                        <div className="text-sm text-muted-foreground mb-2 text-center">Output Prompt</div>
                        <div className="flex-1 overflow-auto whitespace-pre-wrap font-mono text-sm">
                            {enabled.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">✨</div>
                                    <p>Your rendered prompt will appear here...</p>
                                    <small className="text-muted-foreground">Add some elements to get started</small>
                                </div>
                            ) : (
                                <div>{rendered}</div>
                            )}
                        </div>
                        <div className="flex-shrink-0 mt-2">
                            <Button
                                onClick={handleCopyPrompt}
                                disabled={enabled.length === 0}
                                className="w-full"
                                size="sm"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Prompt
                            </Button>
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}


