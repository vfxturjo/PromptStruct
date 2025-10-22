import { StructuralElement } from '@/types';
import { renderPrompt, parseControlSyntax } from '@/utils/syntaxParser';

export interface PreviewPosition {
    start: number;
    end: number;
    elementId: string;
    elementName: string;
}

export interface PreviewMapping {
    positions: PreviewPosition[];
    totalLength: number;
}

/**
 * Creates a mapping between preview text positions and structural elements
 * This allows us to determine which element a piece of text belongs to
 */
export function createPreviewMapping(
    structure: StructuralElement[],
    previewMode: 'clean' | 'raw',
    globalControlValues: Record<string, any>
): PreviewMapping {
    const positions: PreviewPosition[] = [];
    let currentPosition = 0;

    const enabledElements = structure.filter(el => el.enabled);

    for (const element of enabledElements) {
        let elementContent: string;

        if (previewMode === 'raw') {
            elementContent = element.content;
        } else {
            // Clean mode - render with control values
            const controls = parseControlSyntax(element.content);
            elementContent = renderPrompt(element.content, controls, globalControlValues);
        }

        const start = currentPosition;
        const end = currentPosition + elementContent.length;

        positions.push({
            start,
            end,
            elementId: element.id,
            elementName: element.name
        });

        currentPosition = end + 2; // +2 for the \n\n separator between elements
    }

    return {
        positions,
        totalLength: currentPosition
    };
}

/**
 * Finds which structural element a text position belongs to
 */
export function findElementAtPosition(
    mapping: PreviewMapping,
    position: number
): PreviewPosition | null {
    return mapping.positions.find(pos =>
        position >= pos.start && position < pos.end
    ) || null;
}

/**
 * Creates HTML content with data attributes for hover detection
 */
export function createPreviewHTML(
    structure: StructuralElement[],
    previewMode: 'clean' | 'raw',
    globalControlValues: Record<string, any>
): string {
    const enabledElements = structure.filter(el => el.enabled);

    if (enabledElements.length === 0) {
        return '<div class="text-center py-8"><div class="text-4xl mb-4">✨</div><p>Your rendered prompt will appear here...</p><small class="text-muted-foreground">Add some elements to get started</small></div>';
    }

    const htmlParts = enabledElements.map(element => {
        let elementContent: string;

        if (previewMode === 'raw') {
            elementContent = element.content;
        } else {
            const controls = parseControlSyntax(element.content);
            elementContent = renderPrompt(element.content, controls, globalControlValues);
        }

        // Escape HTML and wrap with data attributes
        const escapedContent = elementContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        return `<span data-element-id="${element.id}" data-element-name="${element.name}">${escapedContent}</span>`;
    });

    return htmlParts.join('\n\n');
}

/**
 * Calculates the cursor position within a textarea element
 */
export function getCursorPosition(textarea: HTMLTextAreaElement): number {
    return textarea.selectionStart;
}

/**
 * Sets the cursor position in a textarea element
 */
export function setCursorPosition(textarea: HTMLTextAreaElement, position: number): void {
    textarea.focus();
    textarea.setSelectionRange(position, position);
}

/**
 * Scrolls an element into view smoothly
 */
export function scrollIntoView(element: HTMLElement): void {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
    });
}
