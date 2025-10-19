import { useState, useEffect } from 'react';
import { Project, Prompt } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Save, ChevronDown, ChevronUp, X, Calendar, Tag } from 'lucide-react';

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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Advanced Search
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Search Query */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="search-query">Search Query</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="search-query"
                                    type="text"
                                    value={filters.query}
                                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                                    placeholder="Search projects and prompts..."
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="flex-1"
                                />
                                <Button onClick={handleSearch}>
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Search History */}
                        {searchHistory.length > 0 && (
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Recent Searches
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {searchHistory.map((query, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="cursor-pointer hover:bg-accent"
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
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                            <Tag className="w-5 h-5" />
                            Filters
                        </h4>

                        {/* Tags Filter */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Tag className="w-4 h-4" />
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
                                <Label htmlFor="start-date" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Start Date
                                </Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={filters.dateRange.start}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, start: e.target.value }
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date">End Date</Label>
                                <Input
                                    id="end-date"
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
                            <Label htmlFor="project-type">Project Type</Label>
                            <Select
                                value={filters.projectType}
                                onValueChange={(value) => setFilters(prev => ({
                                    ...prev,
                                    projectType: value as 'all' | 'recent' | 'tagged'
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    <SelectItem value="recent">Recent (Last 7 days)</SelectItem>
                                    <SelectItem value="tagged">Tagged Projects</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort Options */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sort-by">Sort By</Label>
                                <Select
                                    value={filters.sortBy}
                                    onValueChange={(value) => setFilters(prev => ({
                                        ...prev,
                                        sortBy: value as 'name' | 'date' | 'tags'
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="date">Date Created</SelectItem>
                                        <SelectItem value="tags">Number of Tags</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sort-order">Sort Order</Label>
                                <Select
                                    value={filters.sortOrder}
                                    onValueChange={(value) => setFilters(prev => ({
                                        ...prev,
                                        sortOrder: value as 'asc' | 'desc'
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="asc">Ascending</SelectItem>
                                        <SelectItem value="desc">Descending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Saved Searches */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold">Saved Searches</h4>
                            <Collapsible open={showSavedSearches} onOpenChange={setShowSavedSearches}>
                                <CollapsibleTrigger asChild>
                                    <Button variant="outline">
                                        {showSavedSearches ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        {showSavedSearches ? 'Hide' : 'Show'}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-4 mt-4">
                                    {/* Save Current Search */}
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Name for this search..."
                                            value={newSearchName}
                                            onChange={(e) => setNewSearchName(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button onClick={handleSaveSearch} disabled={!newSearchName.trim()}>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save
                                        </Button>
                                    </div>

                                    {/* Saved Searches List */}
                                    {savedSearches.length > 0 ? (
                                        <div className="space-y-2">
                                            {savedSearches.map(savedSearch => (
                                                <Card key={savedSearch.id}>
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleLoadSavedSearch(savedSearch)}
                                                                >
                                                                    {savedSearch.name}
                                                                </Button>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(savedSearch.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveSavedSearch(savedSearch.id)}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No saved searches yet.</p>
                                    )}
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button onClick={handleSearch}>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
