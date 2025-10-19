import { Textarea } from '@/components/ui/textarea';

interface PromptEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function PromptEditor({ value, onChange, placeholder, className }: PromptEditorProps) {
    return (
        <div className={className}>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[400px] font-mono text-sm resize-none"
                style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                    lineHeight: '1.5'
                }}
            />
            <div className="mt-2 text-xs text-muted-foreground">
                💡 Use <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{text:Name:Default}}'}</code>,
                <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{select:Name:Option1|Option2}}'}</code>,
                <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{slider:Name:50}}'}</code>, or
                <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{toggle:Name}}...{{/toggle:Name}}'}</code> for dynamic controls
            </div>
        </div>
    );
}
