import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import { Toaster } from '@/components/ui/sonner'
import './index.css'

// Apply dark theme to the html element
document.documentElement.classList.add('dark')

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
        <Toaster />
    </React.StrictMode>,
)
