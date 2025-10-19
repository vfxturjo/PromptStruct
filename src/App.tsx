import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { ProjectBrowser } from './components/ProjectBrowser';
import { Toaster } from '@/components/ui/sonner';

export function App() {
    return (
        <Router>
            <Toaster />
            <Routes>
                <Route path="/" element={<Navigate to="/browser" replace />} />
                <Route path="/browser" element={<ProjectBrowser />} />
                <Route path="/editor" element={<MainLayout />} />
            </Routes>
        </Router>
    );
}