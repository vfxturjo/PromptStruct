import { useEffect } from 'react';

export interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    action: () => void;
    description: string;
}

export class KeyboardShortcutService {
    private shortcuts: KeyboardShortcut[] = [];
    private isEnabled = true;

    register(shortcut: KeyboardShortcut) {
        this.shortcuts.push(shortcut);
    }

    unregister(key: string) {
        this.shortcuts = this.shortcuts.filter(s => s.key !== key);
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }

    handleKeyDown = (event: KeyboardEvent) => {
        if (!this.isEnabled) return;

        const matchingShortcut = this.shortcuts.find(shortcut => {
            return shortcut.key.toLowerCase() === event.key.toLowerCase() &&
                !!shortcut.ctrlKey === event.ctrlKey &&
                !!shortcut.shiftKey === event.shiftKey &&
                !!shortcut.altKey === event.altKey &&
                !!shortcut.metaKey === event.metaKey;
        });

        if (matchingShortcut) {
            event.preventDefault();
            matchingShortcut.action();
        }
    };

    init() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    getShortcuts() {
        return this.shortcuts;
    }
}

// React hook for using keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    useEffect(() => {
        const service = new KeyboardShortcutService();

        shortcuts.forEach(shortcut => {
            service.register(shortcut);
        });

        service.init();

        return () => {
            service.destroy();
        };
    }, [shortcuts]);
}

// Common shortcuts for the app
export const CommonShortcuts = {
    SAVE: { key: 's', ctrlKey: true, description: 'Save current prompt' },
    NEW_PROJECT: { key: 'n', ctrlKey: true, shiftKey: true, description: 'Create new project' },
    NEW_PROMPT: { key: 'n', ctrlKey: true, description: 'Create new prompt' },
    SEARCH: { key: 'f', ctrlKey: true, description: 'Focus search' },
    BULK_MODE: { key: 'b', ctrlKey: true, description: 'Toggle bulk mode' },
    EXPORT: { key: 'e', ctrlKey: true, description: 'Export project' },
    DELETE: { key: 'Delete', description: 'Delete selected item' },
    ESCAPE: { key: 'Escape', description: 'Cancel current action' },
    ENTER: { key: 'Enter', description: 'Confirm current action' },
};
