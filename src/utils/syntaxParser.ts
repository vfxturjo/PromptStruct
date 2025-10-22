import { ControlElement, ParsedControl } from '@/types';

// Regular expressions for parsing control syntax
const TOGGLE_REGEX = /\{\{toggle:([^}]+)\}\}([\s\S]*?)\{\{\/toggle:\1\}\}/g;

export function parseControlSyntax(content: string): ParsedControl[] {
    const controls: ParsedControl[] = [];

    // Handle undefined or null content
    if (!content || typeof content !== 'string') {
        return controls;
    }

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

    // Parse other control types with more robust logic
    let match;
    const regex = /\{\{([^:}]+):([^:}]+)(?::([^}]*?))?\}\}/g;

    while ((match = regex.exec(content)) !== null) {
        const [fullMatch, type, name, defaultValue] = match;
        const startIndex = match.index;
        const endIndex = startIndex + fullMatch.length;

        // Skip toggle opening tags; toggles are handled separately above
        if (type.trim() === 'toggle') {
            continue;
        }

        // Skip if this is already captured as part of a toggle
        const isInsideToggle = controls.some(control =>
            control.element.type === 'toggle' &&
            startIndex >= control.startIndex &&
            endIndex <= control.endIndex
        );

        if (isInsideToggle) continue;

        // Validate that this is a proper control match
        if (!fullMatch.startsWith('{{') || !fullMatch.endsWith('}}')) {
            continue;
        }

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
                // Parse slider parameters: {{slider:name:default:min:max}}
                const sliderParams = defaultValue?.split(':').map(p => p.trim()) || [];
                element.defaultValue = sliderParams[0] || '50';

                if (sliderParams.length >= 3) {
                    // Custom min/max provided
                    element.min = parseInt(sliderParams[1]) || 0;
                    element.max = parseInt(sliderParams[2]) || 100;
                } else {
                    // Default min/max
                    element.min = 0;
                    element.max = 100;
                }
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

    // Parse nested controls inside toggle blocks (non-recursive to avoid duplicates)
    const nestedControls: ParsedControl[] = [];
    for (const toggleControl of controls) {
        if (toggleControl.element.type === 'toggle') {
            // Parse only non-toggle controls inside the toggle content
            let match;
            const regex = /\{\{([^:}]+):([^:}]+)(?::([^}]*?))?\}\}/g;
            const toggleContent = toggleControl.content || '';

            while ((match = regex.exec(toggleContent)) !== null) {
                if (!match.index) continue;
                const [fullMatch, type, name, defaultValue = ''] = match;
                const startIndex = match.index;
                const endIndex = startIndex + fullMatch.length;

                // Skip toggle controls (they shouldn't be nested)
                if (type.trim() === 'toggle') continue;

                // Validate that this is a proper control match
                if (!fullMatch.startsWith('{{') || !fullMatch.endsWith('}}')) {
                    continue;
                }

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
                        // Parse slider parameters: {{slider:name:default:min:max}}
                        const sliderParams = defaultValue?.split(':').map(p => p.trim()) || [];
                        element.defaultValue = sliderParams[0] || '50';

                        if (sliderParams.length >= 3) {
                            // Custom min/max provided
                            element.min = parseInt(sliderParams[1]) || 0;
                            element.max = parseInt(sliderParams[2]) || 100;
                        } else {
                            // Default min/max
                            element.min = 0;
                            element.max = 100;
                        }
                        break;
                    case 'select':
                        element.options = defaultValue?.split('|').map(opt => opt.trim()) || [];
                        element.defaultValue = element.options[0] || '';
                        break;
                }

                // Adjust indices to be relative to the main content
                nestedControls.push({
                    element,
                    startIndex: startIndex + toggleControl.startIndex,
                    endIndex: endIndex + toggleControl.startIndex,
                });
            }
        }
    }

    // Add nested controls to the main controls list
    controls.push(...nestedControls);

    // Remove duplicates and sort by start index
    const uniqueControls = controls.filter((control, index, self) => {
        // For toggle controls, check if we already have a toggle with the same name
        if (control.element.type === 'toggle') {
            return index === self.findIndex(c =>
                c.element.type === 'toggle' &&
                c.element.name === control.element.name
            );
        }

        // For other controls, keep only the first instance of each unique name+type combination
        // This allows multiple instances of the same control name to be controlled by one UI control
        return index === self.findIndex(c =>
            c.element.name === control.element.name &&
            c.element.type === control.element.type
        );
    });

    return uniqueControls.sort((a, b) => a.startIndex - b.startIndex);
}

export function renderPrompt(
    content: string,
    controls: ParsedControl[],
    values: Record<string, any>
): string {
    let result = content;

    // First, handle toggle controls (they need special processing)
    const toggleControls = controls.filter(c => c.element.type === 'toggle');
    for (let i = toggleControls.length - 1; i >= 0; i--) {
        const control = toggleControls[i];
        const value = values[control.element.name];

        if (value) {
            // Process nested controls within the toggle content
            const nestedControls = controls.filter(c =>
                c.startIndex > control.startIndex &&
                c.endIndex < control.endIndex &&
                c.element.type !== 'toggle'
            );
            let processedContent = control.content;

            // Process nested controls in reverse order
            for (let j = nestedControls.length - 1; j >= 0; j--) {
                const nestedControl = nestedControls[j];
                const nestedValue = values[nestedControl.element.name];
                const replacement = nestedValue !== undefined ? String(nestedValue) : nestedControl.element.defaultValue || '';

                // Adjust indices to be relative to the toggle content
                const relativeStart = nestedControl.startIndex - control.startIndex;
                const relativeEnd = nestedControl.endIndex - control.startIndex;

                processedContent = (processedContent || '').slice(0, relativeStart) +
                    replacement +
                    (processedContent || '').slice(relativeEnd);
            }

            result = result.slice(0, control.startIndex) +
                processedContent +
                result.slice(control.endIndex);
        } else {
            result = result.slice(0, control.startIndex) +
                result.slice(control.endIndex);
        }
    }

    // Then, handle all other control types by replacing ALL instances of each control name
    const nonToggleControls = controls.filter(c => c.element.type !== 'toggle');

    // Group controls by name+type to get unique control definitions
    const uniqueControlDefs = nonToggleControls.filter((control, index, self) =>
        index === self.findIndex(c =>
            c.element.name === control.element.name &&
            c.element.type === control.element.type
        )
    );

    // Replace all instances of each control name
    for (const controlDef of uniqueControlDefs) {
        const value = values[controlDef.element.name];
        const replacement = value !== undefined ? String(value) : controlDef.element.defaultValue || '';

        // Create regex to find all instances of this control
        const controlRegex = new RegExp(
            `\\{\\{${controlDef.element.type}:${controlDef.element.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?::([^}]*?))?\\}\\}`,
            'g'
        );

        result = result.replace(controlRegex, replacement);
    }

    return result;
}

export function generateControlId(name: string): string {
    return `control_${name.toLowerCase().replace(/\s+/g, '_')}`;
}
