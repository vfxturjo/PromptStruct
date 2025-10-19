import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { parseControlSyntax } from '@/utils/syntaxParser';

interface EnhancedTextareaProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
}

const CONTROL_TEMPLATES = {
    text: '{{text:Name:Default}}',
    select: '{{select:Name:Option1|Option2|Option3}}',
    slider: '{{slider:Name:50}}',
    toggle: '{{toggle:Name}}...content...{{/toggle:Name}}'
};

export function EnhancedTextarea({ value, onChange, placeholder, className }: EnhancedTextareaProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
    const [currentWord, setCurrentWord] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Ensure value is always a string
    const safeValue = value || '';

    // Parse controls for highlighting
    const controls = parseControlSyntax(safeValue);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === '{' && e.ctrlKey) {
            e.preventDefault();
            const textarea = textareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newValue = safeValue.slice(0, start) + '{{' + safeValue.slice(end);
                onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);
                setTimeout(() => {
                    textarea.setSelectionRange(start + 2, start + 2);
                    textarea.focus();
                }, 0);
            }
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e);

        const textarea = textareaRef.current;
        if (textarea) {
            const cursorPos = textarea.selectionStart;
            const textBeforeCursor = e.target.value.slice(0, cursorPos);

            // Check if we're typing a control pattern
            const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
            if (lastOpenBrace !== -1) {
                const textAfterOpenBrace = textBeforeCursor.slice(lastOpenBrace + 2);
                const closeBrace = textAfterOpenBrace.indexOf('}}');

                if (closeBrace === -1) {
                    // We're inside a control, show suggestions
                    const wordMatch = textAfterOpenBrace.match(/(\w+)$/);
                    if (wordMatch) {
                        setCurrentWord(wordMatch[1]);
                        showSuggestionDropdown(textarea);
                    } else if (textAfterOpenBrace.length > 0) {
                        // Show suggestions even without a complete word
                        showSuggestionDropdown(textarea);
                    }
                } else {
                    setShowSuggestions(false);
                }
            } else {
                setShowSuggestions(false);
            }
        }
    };

    const showSuggestionDropdown = (textarea: HTMLTextAreaElement) => {
        const rect = textarea.getBoundingClientRect();

        // Calculate cursor position
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = textarea.value.slice(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length - 1;
        const currentColumn = lines[lines.length - 1].length;

        // Approximate character dimensions (this is rough, but works for monospace)
        const charWidth = 8;
        const lineHeight = 20;

        setSuggestionPosition({
            top: rect.top + (currentLine * lineHeight) + lineHeight + 5,
            left: rect.left + (currentColumn * charWidth)
        });

        setShowSuggestions(true);
    };

    const insertTemplate = (template: string) => {
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = safeValue.slice(0, start) + template + safeValue.slice(end);
            onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);
            setShowSuggestions(false);

            // Set cursor position after the template
            setTimeout(() => {
                const newCursorPos = start + template.length;
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
            }, 0);
        }
    };

    // Render syntax highlighting
    const renderHighlightedText = () => {
        if (!safeValue) return '';

        return safeValue.split('\n').map((line, lineIndex) => (
            <div key={lineIndex} className="leading-5">
                {line.split('').map((char, charIndex) => {
                    const globalIndex = safeValue.split('\n').slice(0, lineIndex).join('\n').length +
                        (lineIndex > 0 ? 1 : 0) + charIndex;

                    const control = controls.find(c =>
                        globalIndex >= c.startIndex && globalIndex < c.endIndex
                    );

                    if (control) {
                        const isStart = globalIndex === control.startIndex;
                        const isEnd = globalIndex === control.endIndex - 1;

                        return (
                            <span
                                key={`${lineIndex}-${charIndex}`}
                                className={`${isStart ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-0.5 rounded-l-sm font-medium' : ''}${isEnd ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-0.5 rounded-r-sm font-medium' : ''}${!isStart && !isEnd && control ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium' : ''}`}
                            >
                                {char}
                            </span>
                        );
                    }

                    return <span key={`${lineIndex}-${charIndex}`}>{char}</span>;
                })}
            </div>
        ));
    };

    return (
        <div className="relative">
            <div className="relative">
                <Textarea
                    ref={textareaRef}
                    value={safeValue}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={`${className} ${controls.length > 0 ? 'ring-1 ring-blue-200 dark:ring-blue-800' : ''} bg-transparent relative z-10`}
                    onFocus={() => setShowSuggestions(false)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    style={{
                        color: 'transparent',
                        caretColor: 'hsl(var(--foreground))',
                        background: 'transparent'
                    }}
                />

                {/* Syntax highlighting overlay */}
                <div
                    className="absolute inset-0 pointer-events-none font-mono text-sm whitespace-pre-wrap break-words overflow-hidden border border-input rounded-md bg-background"
                    style={{
                        padding: '0.5rem',
                        margin: 0,
                        lineHeight: '1.25rem',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                        fontSize: '0.875rem',
                        zIndex: 1
                    }}
                >
                    {renderHighlightedText()}
                </div>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && (
                <div
                    className="absolute bg-background border rounded-md shadow-lg z-50 min-w-[250px] max-h-[300px] overflow-y-auto"
                    style={{
                        top: suggestionPosition.top,
                        left: suggestionPosition.left,
                    }}
                >
                    <div className="p-2 text-xs text-muted-foreground border-b bg-muted/50">
                        Dynamic Control Templates
                    </div>
                    {Object.entries(CONTROL_TEMPLATES).map(([type, template]) => (
                        <button
                            key={type}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground border-b last:border-b-0 transition-colors"
                            onClick={() => insertTemplate(template)}
                        >
                            <div className="font-medium capitalize text-foreground">{type}</div>
                            <div className="text-xs text-muted-foreground font-mono mt-1">{template}</div>
                        </button>
                    ))}
                    <div className="p-2 text-xs text-muted-foreground bg-muted/30">
                        Click to insert template
                    </div>
                </div>
            )}

        </div>
    );
}
