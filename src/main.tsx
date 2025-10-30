import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from './components/theme-provider'
import './globals.css'
import { syncNow } from '@/services/syncService'
import { useEditorStore } from '@/stores/editorStore'
import { registerSW } from 'virtual:pwa-register'
import { NotificationService } from '@/services/notificationService'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider defaultTheme="dark" storageKey="promptstruct-theme">
            <App />
            <Toaster />
        </ThemeProvider>
    </React.StrictMode>,
)

// Background sync when the app becomes online and user is signed in
window.addEventListener('online', () => {
    const state = useEditorStore.getState();
    if (state.sync.isSignedIn) {
        syncNow().catch(() => { });
    }
});

// Register Service Worker with callbacks for update/offline notifications
const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
        NotificationService.info('Update available. Reload to apply.');
    },
    onOfflineReady() {
        NotificationService.info('App ready to work offline');
    },
    onRegistered(reg) {
        (window as any).__swReg = reg;
    },
    onRegisterError() {
        NotificationService.error('Service worker registration failed');
    }
});

// Expose a global function to check for updates from UI (e.g., Settings)
;(window as any).__checkForUpdates = async () => {
    if (!navigator.onLine) {
        NotificationService.warning('Offline: using current version');
        return;
    }
    try {
        await updateSW(true);
        const reg: ServiceWorkerRegistration | undefined = (window as any).__swReg;
        if (reg) {
            await reg.update();
            if (!reg.waiting) {
                NotificationService.info('No new updates found');
            }
        } else {
            NotificationService.info('No new updates found');
        }
    } catch {
        NotificationService.error('Could not check for updates');
    }
};
