import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Kbd } from '@/components/ui/kbd';
import { Lightbulb } from 'lucide-react';

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
            />
            <Alert className="mt-1">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription className="text-xs">
                    Use <Kbd>{'{{text:Name:Default}}'}</Kbd>, <Kbd>{'{{select:Name:Option1|Option2}}'}</Kbd>, <Kbd>{'{{slider:Name:50}}'}</Kbd>, or <Kbd>{'{{toggle:Name}}...{{/toggle:Name}}'}</Kbd> for dynamic controls
                </AlertDescription>
            </Alert>
        </div>
    );
}
