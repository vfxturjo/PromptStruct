import { useEditorStore } from '@/stores/editorStore';
import { parseControlSyntax, renderPrompt } from '@/utils/syntaxParser';

export function MiniPreviewPanel() {
    const { structure, uiGlobalControlValues } = useEditorStore();

    const enabled = structure.filter(el => el.enabled);
    const rendered = enabled.map(element => {
        const controls = parseControlSyntax(element.content);
        return renderPrompt(element.content, controls, uiGlobalControlValues);
    }).join('\n\n');

    return (
        <div className="h-full panel-padding flex flex-col">
            <div className="text-sm text-muted-foreground mb-2">Direct Use Preview</div>
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
        </div>
    );
}


