import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/stores/editorStore';

interface EnhancedTextareaProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
    elementId?: string; // ID of the structural element for height persistence
}

const CONTROL_TEMPLATES = {
    text: '{{text:Name:Default}}',
    select: '{{select:Name:Option1|Option2|Option3}}',
    slider: '{{slider:Name:50}}',
    toggle: '{{toggle:Name}}content{{/toggle:Name}}'
};

export function EnhancedTextarea({ value, onChange, placeholder, className, elementId }: EnhancedTextareaProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
    const editorRef = useRef<HTMLDivElement>(null);
    const suggestionRef = useRef<HTMLDivElement>(null);
    const [isComposing, setIsComposing] = useState(false);

    // Get and set text editor height from store
    const { uiTextEditorHeight, setUiTextEditorHeight } = useEditorStore();
    const savedHeight = elementId ? uiTextEditorHeight[elementId] : null;

    // Ensure value is always a string
    const safeValue = value || '';

    // Update content when value changes externally
    useEffect(() => {
        if (editorRef.current && !isComposing) {
            const currentText = editorRef.current.textContent || '';
            if (currentText !== safeValue) {
                updateEditorContent();
            }
        }
    }, [safeValue, isComposing]);


    // Update editor content - NO syntax highlighting to avoid layout issues
    const updateEditorContent = useCallback(() => {
        if (!editorRef.current) return;

        // Simply set text content without any HTML or spans
        editorRef.current.textContent = safeValue;
    }, [safeValue]);


    // Handle content changes
    const handleInput = useCallback(() => {
        setIsComposing(true);

        if (!editorRef.current) return;

        const newValue = editorRef.current.textContent || '';
        onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);

        // Check if we should show suggestions
        setTimeout(() => {
            checkForSuggestions();
            setIsComposing(false);
        }, 0);
    }, [onChange]);

    // Check if we should show suggestions based on cursor position
    const checkForSuggestions = useCallback(() => {
        if (!editorRef.current) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const textBeforeCursor = getTextBeforeCursor(range);

        // Check if we just typed {{
        const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
        if (lastOpenBrace !== -1) {
            const textAfterOpenBrace = textBeforeCursor.slice(lastOpenBrace + 2);
            const closeBrace = textAfterOpenBrace.indexOf('}}');

            if (closeBrace === -1) {
                // We're inside a control, show suggestions
                showSuggestionDropdown(range);
            } else {
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
        }
    }, []);

    // Get text before cursor position
    const getTextBeforeCursor = (range: Range): string => {
        const textNode = range.startContainer;
        const text = textNode.textContent || '';
        const offset = range.startOffset;

        if (textNode.nodeType === Node.TEXT_NODE) {
            return text.slice(0, offset);
        }

        return text.slice(0, offset);
    };

    // Show suggestion dropdown at cursor position
    const showSuggestionDropdown = (range: Range) => {
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current?.getBoundingClientRect();

        if (!editorRect) return;

        setSuggestionPosition({
            top: rect.bottom + 5,
            left: rect.left
        });
        setShowSuggestions(true);
        setSelectedSuggestionIndex(0);
    };

    // Insert template at cursor position
    const insertTemplate = (template: string) => {
        if (!editorRef.current) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);

        // Find the {{ that triggered the suggestion
        const textBeforeCursor = getTextBeforeCursor(range);
        const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');

        if (lastOpenBrace !== -1) {
            // Update the value
            const newValue = safeValue.slice(0, safeValue.indexOf(textBeforeCursor) + lastOpenBrace) + template + safeValue.slice(safeValue.indexOf(textBeforeCursor) + range.startOffset);
            onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);
        }

        setShowSuggestions(false);
        editorRef.current.focus();
    };

    // Handle keyboard events
    const handleKeyDown = (e: React.KeyboardEvent) => {
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
        if (!editorRef.current || !elementId) return;

        const height = editorRef.current.offsetHeight;
        setUiTextEditorHeight(elementId, height);
    }, [elementId, setUiTextEditorHeight]);

    // Set up resize observer to detect height changes
    useEffect(() => {
        if (!editorRef.current || !elementId) return;

        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });

        resizeObserver.observe(editorRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [handleResize, elementId]);


    return (
        <div className="relative">
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className={cn(
                    "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono text-sm whitespace-pre-wrap break-words overflow-auto text-editor-max-height",
                    "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none",
                    className
                )}
                style={{
                    minHeight: '80px',
                    height: savedHeight ? `${savedHeight}px` : 'auto',
                    resize: 'vertical'
                }}
                suppressContentEditableWarning={true}
                data-placeholder={placeholder}
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
