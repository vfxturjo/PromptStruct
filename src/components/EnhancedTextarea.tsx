import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/stores/editorStore';

interface EnhancedTextareaProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
    elementId?: string; // ID of the structural element for height persistence
}

export interface EnhancedTextareaRef {
    focus: () => void;
    setSelectionRange: (start: number, end: number) => void;
    getSelectionStart: () => number;
    getSelectionEnd: () => number;
}

const CONTROL_TEMPLATES = {
    text: '{{text:Name:Default}}',
    select: '{{select:Name:Option1|Option2|Option3}}',
    slider: '{{slider:Name:50}}',
    toggle: '{{toggle:Name}}content{{/toggle:Name}}'
};

export const EnhancedTextarea = forwardRef<EnhancedTextareaRef, EnhancedTextareaProps>(
    ({ value, onChange, placeholder, className, elementId }, ref) => {
        const [showSuggestions, setShowSuggestions] = useState(false);
        const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
        const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const suggestionRef = useRef<HTMLDivElement>(null);

        // Get and set text editor height from store
        const { uiTextEditorHeight, setUiTextEditorHeight } = useEditorStore();
        const savedHeight = elementId ? uiTextEditorHeight[elementId] : null;

        // Expose methods to parent components
        useImperativeHandle(ref, () => ({
            focus: () => textareaRef.current?.focus(),
            setSelectionRange: (start: number, end: number) => {
                if (textareaRef.current) {
                    textareaRef.current.setSelectionRange(start, end);
                }
            },
            getSelectionStart: () => textareaRef.current?.selectionStart || 0,
            getSelectionEnd: () => textareaRef.current?.selectionEnd || 0,
        }));

        // Check if we should show suggestions based on cursor position
        const checkForSuggestions = useCallback(() => {
            if (!textareaRef.current) return;

            const cursorPosition = textareaRef.current.selectionStart;
            const textBeforeCursor = value.slice(0, cursorPosition);

            // Check if we just typed {{
            const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
            if (lastOpenBrace !== -1) {
                const textAfterOpenBrace = textBeforeCursor.slice(lastOpenBrace + 2);
                const closeBrace = textAfterOpenBrace.indexOf('}}');

                if (closeBrace === -1) {
                    // We're inside a control, show suggestions
                    showSuggestionDropdown();
                } else {
                    setShowSuggestions(false);
                }
            } else {
                setShowSuggestions(false);
            }
        }, [value]);

        // Show suggestion dropdown at cursor position
        const showSuggestionDropdown = () => {
            if (!textareaRef.current) return;

            const textarea = textareaRef.current;
            const cursorPosition = textarea.selectionStart;

            // Create a temporary span to measure text position
            const span = document.createElement('span');
            span.style.position = 'absolute';
            span.style.visibility = 'hidden';
            span.style.whiteSpace = 'pre-wrap';
            span.style.font = window.getComputedStyle(textarea).font;
            span.style.padding = window.getComputedStyle(textarea).padding;
            span.style.border = window.getComputedStyle(textarea).border;
            span.style.width = window.getComputedStyle(textarea).width;

            const textBeforeCursor = value.slice(0, cursorPosition);
            span.textContent = textBeforeCursor;

            document.body.appendChild(span);
            const rect = span.getBoundingClientRect();
            const textareaRect = textarea.getBoundingClientRect();

            setSuggestionPosition({
                top: textareaRect.top + rect.height + 5,
                left: textareaRect.left + rect.width
            });

            document.body.removeChild(span);
            setShowSuggestions(true);
            setSelectedSuggestionIndex(0);
        };

        // Insert template at cursor position
        const insertTemplate = (template: string) => {
            if (!textareaRef.current) return;

            const textarea = textareaRef.current;
            const cursorPosition = textarea.selectionStart;
            const textBeforeCursor = value.slice(0, cursorPosition);
            const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');

            if (lastOpenBrace !== -1) {
                // Replace the {{... with the template
                const newValue = value.slice(0, lastOpenBrace) + template + value.slice(cursorPosition);
                onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);

                // Set cursor position after the inserted template
                setTimeout(() => {
                    const newCursorPosition = lastOpenBrace + template.length;
                    textarea.setSelectionRange(newCursorPosition, newCursorPosition);
                }, 0);
            }

            setShowSuggestions(false);
            textarea.focus();
        };

        // Handle keyboard events
        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (showSuggestions) {
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        setSelectedSuggestionIndex(prev =>
                            prev < Object.keys(CONTROL_TEMPLATES).length - 1 ? prev + 1 : 0
                        );
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        setSelectedSuggestionIndex(prev =>
                            prev > 0 ? prev - 1 : Object.keys(CONTROL_TEMPLATES).length - 1
                        );
                        break;
                    case 'Enter':
                        e.preventDefault();
                        const templates = Object.values(CONTROL_TEMPLATES);
                        insertTemplate(templates[selectedSuggestionIndex]);
                        break;
                    case 'Escape':
                        e.preventDefault();
                        setShowSuggestions(false);
                        break;
                }
            }
        };

        // Handle input changes
        const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onChange(e);

            // Check for suggestions after a short delay
            setTimeout(() => {
                checkForSuggestions();
            }, 0);
        };

        // Handle clicks outside to close suggestions
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                    setShowSuggestions(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        // Handle text editor resize to save height
        const handleResize = useCallback(() => {
            if (!textareaRef.current || !elementId) return;

            const height = textareaRef.current.offsetHeight;
            setUiTextEditorHeight(elementId, height);
        }, [elementId, setUiTextEditorHeight]);

        // Set up resize observer to detect height changes
        useEffect(() => {
            if (!textareaRef.current || !elementId) return;

            const resizeObserver = new ResizeObserver(() => {
                handleResize();
            });

            resizeObserver.observe(textareaRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }, [handleResize, elementId]);

        return (
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono text-sm whitespace-pre-wrap break-words overflow-auto text-editor-max-height resize-y",
                        "placeholder:text-muted-foreground",
                        className
                    )}
                    style={{
                        minHeight: '80px',
                        height: savedHeight ? `${savedHeight}px` : 'auto',
                    }}
                    placeholder={placeholder}
                    data-element-textarea-id={elementId}
                />

                {/* Suggestions dropdown */}
                {showSuggestions && (
                    <div
                        ref={suggestionRef}
                        className="absolute bg-background border rounded-md shadow-lg z-50 min-w-[280px] max-h-[300px] overflow-y-auto"
                        style={{
                            top: suggestionPosition.top,
                            left: suggestionPosition.left,
                        }}
                    >
                        <div className="p-2 text-xs text-muted-foreground border-b bg-muted/50">
                            Dynamic Control Templates
                        </div>
                        {Object.entries(CONTROL_TEMPLATES).map(([type, template], index) => (
                            <button
                                key={type}
                                className={cn(
                                    "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground border-b last:border-b-0 transition-colors",
                                    index === selectedSuggestionIndex && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => insertTemplate(template)}
                                onMouseEnter={() => setSelectedSuggestionIndex(index)}
                            >
                                <div className="font-medium capitalize text-foreground">{type}</div>
                                <div className="text-xs text-muted-foreground font-mono mt-1">{template}</div>
                            </button>
                        ))}
                        <div className="p-2 text-xs text-muted-foreground bg-muted/30">
                            Use ↑↓ to navigate, Enter to insert, Esc to close
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

EnhancedTextarea.displayName = 'EnhancedTextarea';
