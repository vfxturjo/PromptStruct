import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from './components/theme-provider'
import './globals.css'
import { syncNow } from '@/services/syncService'
import { useEditorStore } from '@/stores/editorStore'

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
