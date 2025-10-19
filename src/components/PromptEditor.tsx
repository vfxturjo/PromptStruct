interface PromptEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function PromptEditor({ value, onChange, placeholder, className }: PromptEditorProps) {
    return (
        <div className={className}>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    minHeight: '400px',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    resize: 'none'
                }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                💡 Use <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>{'{{text:Name:Default}}'}</code>,
                <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>{'{{select:Name:Option1|Option2}}'}</code>,
                <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>{'{{slider:Name:50}}'}</code>, or
                <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>{'{{toggle:Name}}...{{/toggle:Name}}'}</code> for dynamic controls
            </div>
        </div>
    );
}
