import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { ProjectBrowser } from './components/ProjectBrowser';
import { OfflineIndicator } from './components/OfflineIndicator';

export function App() {
    return (
        <Router basename="/PromptStruct/">
            <Routes>
                <Route path="/" element={<Navigate to="/browser" replace />} />
                <Route path="/browser" element={<ProjectBrowser />} />
                <Route path="/editor" element={<MainLayout />} />
            </Routes>
            <OfflineIndicator />
        </Router>
    );
}