import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';
import { Project, Prompt } from '@/types';
import { Search, Filter, X, Tag, Calendar, Save, History } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Advanced Search
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Search Query */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="search-query">Search Query</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="search-query"
                                    value={filters.query}
                                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                                    placeholder="Search projects and prompts..."
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button onClick={handleSearch}>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Search History */}
                        {searchHistory.length > 0 && (
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <History className="h-4 w-4" />
                                    Recent Searches
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {searchHistory.map((query, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-muted"
                                            onClick={() => handleHistoryClick(query)}
                                        >
                                            {query}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Filters */}
                    <div className="space-y-4">
                        <Typography variant="h3" className="text-lg font-medium flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </Typography>

                        {/* Tags Filter */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Tags
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <Badge
                                        key={tag}
                                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setFilters(prev => ({
                                                ...prev,
                                                tags: prev.tags.includes(tag)
                                                    ? prev.tags.filter(t => t !== tag)
                                                    : [...prev.tags, tag]
                                            }));
                                        }}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Start Date
                                </Label>
                                <Input
                                    type="date"
                                    value={filters.dateRange.start}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, start: e.target.value }
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={filters.dateRange.end}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, end: e.target.value }
                                    }))}
                                />
                            </div>
                        </div>

                        {/* Project Type */}
                        <div className="space-y-2">
                            <Label>Project Type</Label>
                            <select
                                value={filters.projectType}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    projectType: e.target.value as 'all' | 'recent' | 'tagged'
                                }))}
                                className="w-full p-2 border rounded-md bg-background"
                            >
                                <option value="all">All Projects</option>
                                <option value="recent">Recent (Last 7 days)</option>
                                <option value="tagged">Tagged Projects</option>
                            </select>
                        </div>

                        {/* Sort Options */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Sort By</Label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        sortBy: e.target.value as 'name' | 'date' | 'tags'
                                    }))}
                                    className="w-full p-2 border rounded-md bg-background"
                                >
                                    <option value="name">Name</option>
                                    <option value="date">Date Created</option>
                                    <option value="tags">Number of Tags</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Sort Order</Label>
                                <select
                                    value={filters.sortOrder}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        sortOrder: e.target.value as 'asc' | 'desc'
                                    }))}
                                    className="w-full p-2 border rounded-md bg-background"
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Saved Searches */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Typography variant="h3" className="text-lg font-medium">Saved Searches</Typography>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSavedSearches(!showSavedSearches)}
                            >
                                {showSavedSearches ? 'Hide' : 'Show'}
                            </Button>
                        </div>

                        {showSavedSearches && (
                            <div className="space-y-4">
                                {/* Save Current Search */}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Name for this search..."
                                        value={newSearchName}
                                        onChange={(e) => setNewSearchName(e.target.value)}
                                    />
                                    <Button onClick={handleSaveSearch} disabled={!newSearchName.trim()}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                </div>

                                {/* Saved Searches List */}
                                {savedSearches.length > 0 ? (
                                    <div className="space-y-2">
                                        {savedSearches.map(savedSearch => (
                                            <div key={savedSearch.id} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleLoadSavedSearch(savedSearch)}
                                                    >
                                                        {savedSearch.name}
                                                    </Button>
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(savedSearch.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveSavedSearch(savedSearch.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Typography variant="muted">No saved searches yet.</Typography>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button onClick={handleSearch}>
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
