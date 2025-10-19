import { ControlElement, ParsedControl } from '@/types';

// Regular expressions for parsing control syntax
const CONTROL_REGEX = /\{\{([^:]+):([^:]+)(?::([^}]+))?\}\}/g;
const TOGGLE_REGEX = /\{\{toggle:([^}]+)\}\}([\s\S]*?)\{\{\/toggle:\1\}\}/g;

export function parseControlSyntax(content: string): ParsedControl[] {
    const controls: ParsedControl[] = [];

    // Parse toggle blocks first (they can contain other controls)
    const toggleMatches = Array.from(content.matchAll(TOGGLE_REGEX));
    for (const toggleMatch of toggleMatches) {
        const [fullMatch, name, innerContent] = toggleMatch;
        const startIndex = toggleMatch.index!;
        const endIndex = startIndex + fullMatch.length;

        controls.push({
            element: {
                type: 'toggle',
                name: name.trim(),
                start: startIndex,
                end: endIndex,
            },
            startIndex,
            endIndex,
            content: innerContent,
        });
    }

    // Parse other control types
    const controlMatches = Array.from(content.matchAll(CONTROL_REGEX));
    for (const controlMatch of controlMatches) {
        const [fullMatch, type, name, defaultValue] = controlMatch;
        const startIndex = controlMatch.index!;
        const endIndex = startIndex + fullMatch.length;

        // Skip if this is already captured as part of a toggle
        const isInsideToggle = controls.some(control =>
            control.element.type === 'toggle' &&
            startIndex > control.startIndex &&
            endIndex < control.endIndex
        );

        if (isInsideToggle) continue;

        const element: ControlElement = {
            type: type.trim() as ControlElement['type'],
            name: name.trim(),
        };

        // Add type-specific properties
        switch (element.type) {
            case 'text':
                element.defaultValue = defaultValue?.trim() || '';
                break;
            case 'slider':
                element.defaultValue = defaultValue?.trim() || '50';
                element.min = 0;
                element.max = 100;
                break;
            case 'select':
                element.options = defaultValue?.split('|').map(opt => opt.trim()) || [];
                element.defaultValue = element.options[0] || '';
                break;
        }

        controls.push({
            element,
            startIndex,
            endIndex,
        });
    }

    return controls.sort((a, b) => a.startIndex - b.startIndex);
}

export function renderPrompt(
    content: string,
    controls: ParsedControl[],
    values: Record<string, any>
): string {
    let result = content;

    // Process controls in reverse order to maintain indices
    for (let i = controls.length - 1; i >= 0; i--) {
        const control = controls[i];
        const value = values[control.element.name];

        if (control.element.type === 'toggle') {
            // For toggles, include or exclude the content based on value
            if (value) {
                result = result.slice(0, control.startIndex) +
                    control.content +
                    result.slice(control.endIndex);
            } else {
                result = result.slice(0, control.startIndex) +
                    result.slice(control.endIndex);
            }
        } else {
            // For other controls, replace with the current value
            const replacement = value !== undefined ? String(value) : control.element.defaultValue || '';
            result = result.slice(0, control.startIndex) +
                replacement +
                result.slice(control.endIndex);
        }
    }

    return result;
}

export function generateControlId(name: string): string {
    return `control_${name.toLowerCase().replace(/\s+/g, '_')}`;
}
