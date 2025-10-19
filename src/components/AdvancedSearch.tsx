import { useState, useEffect } from 'react';
import { Project, Prompt } from '@/types';

interface SearchFilters {
    query: string;
    tags: string[];
    dateRange: {
        start: string;
        end: string;
    };
    projectType: 'all' | 'recent' | 'tagged';
    sortBy: 'name' | 'date' | 'tags';
    sortOrder: 'asc' | 'desc';
}

interface SavedSearch {
    id: string;
    name: string;
    filters: SearchFilters;
    createdAt: string;
}

interface AdvancedSearchProps {
    isOpen: boolean;
    projects: Project[];
    prompts: Prompt[];
    onSearchResults: (results: { projects: Project[]; prompts: Prompt[] }) => void;
    onClose: () => void;
}

export function AdvancedSearch({ isOpen, projects, prompts, onSearchResults, onClose }: AdvancedSearchProps) {
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        tags: [],
        dateRange: { start: '', end: '' },
        projectType: 'all',
        sortBy: 'name',
        sortOrder: 'asc'
    });

    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [showSavedSearches, setShowSavedSearches] = useState(false);
    const [newSearchName, setNewSearchName] = useState('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    // Load saved searches and history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('gemini-saved-searches');
        if (saved) {
            setSavedSearches(JSON.parse(saved));
        }

        const history = localStorage.getItem('gemini-search-history');
        if (history) {
            setSearchHistory(JSON.parse(history));
        }
    }, []);

    // Perform search
    const performSearch = (searchFilters: SearchFilters) => {
        let filteredProjects = [...projects];
        let filteredPrompts = [...prompts];

        // Text query filter
        if (searchFilters.query) {
            const query = searchFilters.query.toLowerCase();
            filteredProjects = filteredProjects.filter(project =>
                project.name.toLowerCase().includes(query) ||
                project.description?.toLowerCase().includes(query) ||
                project.tags.some(tag => tag.toLowerCase().includes(query))
            );
            filteredPrompts = filteredPrompts.filter(prompt =>
                prompt.name.toLowerCase().includes(query) ||
                prompt.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Tags filter
        if (searchFilters.tags.length > 0) {
            filteredProjects = filteredProjects.filter(project =>
                searchFilters.tags.some(tag => project.tags.includes(tag))
            );
            filteredPrompts = filteredPrompts.filter(prompt =>
                searchFilters.tags.some(tag => prompt.tags.includes(tag))
            );
        }

        // Date range filter
        if (searchFilters.dateRange.start || searchFilters.dateRange.end) {
            const startDate = searchFilters.dateRange.start ? new Date(searchFilters.dateRange.start) : null;
            const endDate = searchFilters.dateRange.end ? new Date(searchFilters.dateRange.end) : null;

            filteredProjects = filteredProjects.filter(project => {
                const projectDate = new Date(project.createdAt);
                return (!startDate || projectDate >= startDate) && (!endDate || projectDate <= endDate);
            });
            filteredPrompts = filteredPrompts.filter(prompt => {
                const promptDate = new Date(prompt.createdAt);
                return (!startDate || promptDate >= startDate) && (!endDate || promptDate <= endDate);
            });
        }

        // Project type filter
        if (searchFilters.projectType === 'recent') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            filteredProjects = filteredProjects.filter(project =>
                new Date(project.createdAt) >= oneWeekAgo
            );
        } else if (searchFilters.projectType === 'tagged') {
            filteredProjects = filteredProjects.filter(project => project.tags.length > 0);
        }

        // Sorting
        const sortItems = (items: (Project | Prompt)[], sortBy: string, order: 'asc' | 'desc') => {
            return items.sort((a, b) => {
                let comparison = 0;

                if (sortBy === 'name') {
                    comparison = a.name.localeCompare(b.name);
                } else if (sortBy === 'date') {
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                } else if (sortBy === 'tags') {
                    comparison = a.tags.length - b.tags.length;
                }

                return order === 'desc' ? -comparison : comparison;
            });
        };

        filteredProjects = sortItems(filteredProjects, searchFilters.sortBy, searchFilters.sortOrder) as Project[];
        filteredPrompts = sortItems(filteredPrompts, searchFilters.sortBy, searchFilters.sortOrder) as Prompt[];

        onSearchResults({ projects: filteredProjects, prompts: filteredPrompts });

        // Add to search history
        if (searchFilters.query && !searchHistory.includes(searchFilters.query)) {
            const newHistory = [searchFilters.query, ...searchHistory].slice(0, 10);
            setSearchHistory(newHistory);
            localStorage.setItem('gemini-search-history', JSON.stringify(newHistory));
        }
    };

    const handleSearch = () => {
        performSearch(filters);
    };

    const handleSaveSearch = () => {
        if (!newSearchName.trim()) return;

        const savedSearch: SavedSearch = {
            id: `search_${Date.now()}`,
            name: newSearchName.trim(),
            filters: { ...filters },
            createdAt: new Date().toISOString()
        };

        const newSavedSearches = [...savedSearches, savedSearch];
        setSavedSearches(newSavedSearches);
        localStorage.setItem('gemini-saved-searches', JSON.stringify(newSavedSearches));
        setNewSearchName('');
    };

    const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
        setFilters(savedSearch.filters);
        performSearch(savedSearch.filters);
    };

    const handleRemoveSavedSearch = (searchId: string) => {
        const newSavedSearches = savedSearches.filter(s => s.id !== searchId);
        setSavedSearches(newSavedSearches);
        localStorage.setItem('gemini-saved-searches', JSON.stringify(newSavedSearches));
    };

    const handleHistoryClick = (query: string) => {
        setFilters(prev => ({ ...prev, query }));
        performSearch({ ...filters, query });
    };

    // Get all unique tags
    const allTags = Array.from(new Set([
        ...projects.flatMap(p => p.tags),
        ...prompts.flatMap(p => p.tags)
    ])).sort();

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: 'white', borderRadius: '4px', width: '100%', maxWidth: '1024px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🔍 Advanced Search
                    </h3>
                    <button onClick={onClose} style={{ padding: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>
                        ×
                    </button>
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Search Query */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="search-query" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Search Query</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    id="search-query"
                                    type="text"
                                    value={filters.query}
                                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                                    placeholder="Search projects and prompts..."
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <button onClick={handleSearch} style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>
                                    🔍
                                </button>
                            </div>
                        </div>

                        {/* Search History */}
                        {searchHistory.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                                    📜 Recent Searches
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {searchHistory.map((query, index) => (
                                        <span
                                            key={index}
                                            onClick={() => handleHistoryClick(query)}
                                            style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                                        >
                                            {query}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '24px 0' }} />

                    {/* Filters */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🔧 Filters
                        </h4>

                        {/* Tags Filter */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                                🏷️ Tags
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {allTags.map(tag => (
                                    <span
                                        key={tag}
                                        onClick={() => {
                                            setFilters(prev => ({
                                                ...prev,
                                                tags: prev.tags.includes(tag)
                                                    ? prev.tags.filter(t => t !== tag)
                                                    : [...prev.tags, tag]
                                            }));
                                        }}
                                        style={{
                                            background: filters.tags.includes(tag) ? '#007bff' : '#f0f0f0',
                                            color: filters.tags.includes(tag) ? 'white' : 'black',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                                    📅 Start Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateRange.start}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, start: e.target.value }
                                    }))}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>End Date</label>
                                <input
                                    type="date"
                                    value={filters.dateRange.end}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, end: e.target.value }
                                    }))}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                        </div>

                        {/* Project Type */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Project Type</label>
                            <select
                                value={filters.projectType}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    projectType: e.target.value as 'all' | 'recent' | 'tagged'
                                }))}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                            >
                                <option value="all">All Projects</option>
                                <option value="recent">Recent (Last 7 days)</option>
                                <option value="tagged">Tagged Projects</option>
                            </select>
                        </div>

                        {/* Sort Options */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Sort By</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        sortBy: e.target.value as 'name' | 'date' | 'tags'
                                    }))}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                                >
                                    <option value="name">Name</option>
                                    <option value="date">Date Created</option>
                                    <option value="tags">Number of Tags</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Sort Order</label>
                                <select
                                    value={filters.sortOrder}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        sortOrder: e.target.value as 'asc' | 'desc'
                                    }))}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '24px 0' }} />

                    {/* Saved Searches */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Saved Searches</h4>
                            <button
                                onClick={() => setShowSavedSearches(!showSavedSearches)}
                                style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                            >
                                {showSavedSearches ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {showSavedSearches && (
                            <div>
                                {/* Save Current Search */}
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                    <input
                                        type="text"
                                        placeholder="Name for this search..."
                                        value={newSearchName}
                                        onChange={(e) => setNewSearchName(e.target.value)}
                                        style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                    />
                                    <button onClick={handleSaveSearch} disabled={!newSearchName.trim()} style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>
                                        💾 Save
                                    </button>
                                </div>

                                {/* Saved Searches List */}
                                {savedSearches.length > 0 ? (
                                    <div>
                                        {savedSearches.map(savedSearch => (
                                            <div key={savedSearch.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleLoadSavedSearch(savedSearch)}
                                                        style={{ padding: '4px 8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                                    >
                                                        {savedSearch.name}
                                                    </button>
                                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                                        {new Date(savedSearch.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveSavedSearch(savedSearch.id)}
                                                    style={{ padding: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#666', fontSize: '14px' }}>No saved searches yet.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px' }}>
                        <button onClick={onClose} style={{ padding: '12px 24px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', borderRadius: '4px' }}>
                            Close
                        </button>
                        <button onClick={handleSearch} style={{ padding: '12px 24px', border: '1px solid #ccc', background: '#007bff', color: 'white', cursor: 'pointer', borderRadius: '4px' }}>
                            🔍 Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
