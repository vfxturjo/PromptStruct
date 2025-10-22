import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Tag, FolderOpen, FileText } from 'lucide-react';
import { Project, Prompt } from '@/types';

interface SearchCriteria {
    id: string;
    type: 'text' | 'tag' | 'project' | 'type';
    value: string;
    label: string;
}

interface EnhancedSearchBarProps {
    projects: Project[];
    prompts: Prompt[];
    onSearchResults: (results: { projects: Project[]; prompts: Prompt[] }) => void;
    onClearResults: () => void;
}

export function EnhancedSearchBar({ projects, prompts, onSearchResults, onClearResults }: EnhancedSearchBarProps) {
    const [criteria, setCriteria] = useState<SearchCriteria[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [showProjectSelector, setShowProjectSelector] = useState(false);
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get all unique tags
    const allTags = Array.from(new Set([
        ...projects.flatMap(p => p.tags),
        ...prompts.flatMap(p => p.tags)
    ])).sort();

    const addCriteria = (type: SearchCriteria['type'], value: string, label: string) => {
        const newCriteria: SearchCriteria = {
            id: `${type}_${Date.now()}`,
            type,
            value,
            label
        };
        setCriteria(prev => [...prev, newCriteria]);
        setInputValue('');
        setShowTagSelector(false);
        setShowProjectSelector(false);
        setShowTypeSelector(false);
    };

    const removeCriteria = (id: string) => {
        setCriteria(prev => prev.filter(c => c.id !== id));
    };

    const clearAllCriteria = () => {
        setCriteria([]);
        setInputValue('');
        onClearResults();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            addCriteria('text', inputValue.trim(), inputValue.trim());
        }
    };

    const performSearch = () => {
        let filteredProjects = [...projects];
        let filteredPrompts = [...prompts];

        criteria.forEach(criterion => {
            switch (criterion.type) {
                case 'text':
                    const query = criterion.value.toLowerCase();
                    filteredProjects = filteredProjects.filter(project =>
                        project.name.toLowerCase().includes(query) ||
                        project.description?.toLowerCase().includes(query) ||
                        project.tags.some(tag => tag.toLowerCase().includes(query))
                    );
                    filteredPrompts = filteredPrompts.filter(prompt =>
                        prompt.name.toLowerCase().includes(query) ||
                        prompt.tags.some(tag => tag.toLowerCase().includes(query))
                    );
                    break;

                case 'tag':
                    filteredProjects = filteredProjects.filter(project =>
                        project.tags.includes(criterion.value)
                    );
                    filteredPrompts = filteredPrompts.filter(prompt =>
                        prompt.tags.includes(criterion.value)
                    );
                    break;

                case 'project':
                    const projectPrompts = prompts.filter(p =>
                        projects.find(proj => proj.id === criterion.value)?.prompts.includes(p.id)
                    );
                    filteredPrompts = filteredPrompts.filter(prompt =>
                        projectPrompts.some(p => p.id === prompt.id)
                    );
                    // Also include the project itself
                    const targetProject = projects.find(p => p.id === criterion.value);
                    if (targetProject) {
                        filteredProjects = filteredProjects.filter(p => p.id === criterion.value);
                    }
                    break;

                case 'type':
                    if (criterion.value === 'projects') {
                        filteredPrompts = [];
                    } else if (criterion.value === 'prompts') {
                        filteredProjects = [];
                    }
                    break;
            }
        });

        onSearchResults({ projects: filteredProjects, prompts: filteredPrompts });
    };

    // Auto-search when criteria change
    useEffect(() => {
        if (criteria.length > 0) {
            performSearch();
        }
    }, [criteria]);

    const getCriteriaIcon = (type: SearchCriteria['type']) => {
        switch (type) {
            case 'text': return <Search className="w-3 h-3" />;
            case 'tag': return <Tag className="w-3 h-3" />;
            case 'project': return <FolderOpen className="w-3 h-3" />;
            case 'type': return <FileText className="w-3 h-3" />;
            default: return <Search className="w-3 h-3" />;
        }
    };

    const getCriteriaColor = (type: SearchCriteria['type']) => {
        switch (type) {
            case 'text': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'tag': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'project': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'type': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <div className="space-y-2">
            {/* Search Input with Criteria Chips */}
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-background">
                <div className="flex flex-wrap items-center gap-1 flex-1">
                    {criteria.map(criterion => (
                        <Badge
                            key={criterion.id}
                            variant="secondary"
                            className={`flex items-center gap-1 ${getCriteriaColor(criterion.type)}`}
                        >
                            {getCriteriaIcon(criterion.type)}
                            <span className="text-xs">{criterion.label}</span>
                            <button
                                onClick={() => removeCriteria(criterion.id)}
                                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder={criteria.length === 0 ? "Search projects and prompts..." : "Add more criteria..."}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="border-0 shadow-none focus-visible:ring-0 flex-1 min-w-[200px]"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                    <Popover open={showTagSelector} onOpenChange={setShowTagSelector}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Tag className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Add Tag Filter</Label>
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {allTags.map(tag => (
                                        <div key={tag} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={tag}
                                                checked={criteria.some(c => c.type === 'tag' && c.value === tag)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        addCriteria('tag', tag, tag);
                                                    } else {
                                                        const criterionToRemove = criteria.find(c => c.type === 'tag' && c.value === tag);
                                                        if (criterionToRemove) {
                                                            removeCriteria(criterionToRemove.id);
                                                        }
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={tag} className="text-sm cursor-pointer">
                                                {tag}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover open={showProjectSelector} onOpenChange={setShowProjectSelector}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <FolderOpen className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Search Within Project</Label>
                                <Select onValueChange={(value) => {
                                    const project = projects.find(p => p.id === value);
                                    if (project) {
                                        addCriteria('project', value, project.name);
                                    }
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select project..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(project => (
                                            <SelectItem key={project.id} value={project.id}>
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover open={showTypeSelector} onOpenChange={setShowTypeSelector}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Filter by Type</Label>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="projects-only"
                                            checked={criteria.some(c => c.type === 'type' && c.value === 'projects')}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    // Remove any existing type criteria
                                                    setCriteria(prev => prev.filter(c => c.type !== 'type'));
                                                    addCriteria('type', 'projects', 'Projects Only');
                                                }
                                            }}
                                        />
                                        <Label htmlFor="projects-only" className="text-sm cursor-pointer">
                                            Projects Only
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="prompts-only"
                                            checked={criteria.some(c => c.type === 'type' && c.value === 'prompts')}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    // Remove any existing type criteria
                                                    setCriteria(prev => prev.filter(c => c.type !== 'type'));
                                                    addCriteria('type', 'prompts', 'Prompts Only');
                                                }
                                            }}
                                        />
                                        <Label htmlFor="prompts-only" className="text-sm cursor-pointer">
                                            Prompts Only
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {criteria.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearAllCriteria}>
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Search Summary */}
            {criteria.length > 0 && (
                <div className="text-xs text-muted-foreground">
                    {criteria.length} filter{criteria.length > 1 ? 's' : ''} active
                </div>
            )}
        </div>
    );
}
