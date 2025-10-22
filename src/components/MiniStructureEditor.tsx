import { useEditorStore } from '@/stores/editorStore';
import { parseControlSyntax } from '@/utils/syntaxParser';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function MiniStructureEditor() {
    const {
        structure,
        starredControls,
        starredTextBoxes,
        uiGlobalControlValues,
        uiMiniEditorCollapsed,
        setUiGlobalControlValues,
        setUiMiniEditorCollapsed,
        updateStructuralElement,
        toggleStructuralElement
    } = useEditorStore();

    const handleControlChange = (name: string, value: any) => {
        setUiGlobalControlValues({ ...uiGlobalControlValues, [name]: value });
    };

    const handleToggleCollapse = (elementId: string) => {
        const currentCollapsed = uiMiniEditorCollapsed[elementId] || false;
        setUiMiniEditorCollapsed(elementId, !currentCollapsed);
    };

    // Filter elements that have starred items
    const elementsWithStarredItems = structure.filter(element => {
        const hasStarredTextBox = Array.isArray(starredTextBoxes) ? starredTextBoxes.includes(element.id) : false;
        const hasStarredControls = starredControls[element.id] && starredControls[element.id].length > 0;
        return hasStarredTextBox || hasStarredControls;
    });

    if (elementsWithStarredItems.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-4">⭐</div>
                <p>No starred items</p>
                <small>Star controls or text boxes to see them here</small>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {elementsWithStarredItems.map((element) => {
                const isCollapsed = uiMiniEditorCollapsed[element.id] || false;
                const elementStarredControls = starredControls[element.id] || [];
                const isTextBoxStarred = Array.isArray(starredTextBoxes) ? starredTextBoxes.includes(element.id) : false;
                const controls = parseControlSyntax(element.content);

                return (
                    <Card key={element.id} className="bg-muted/30">
                        <CardHeader className="p-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleCollapse(element.id)}
                                        className="p-1 h-6 w-6"
                                    >
                                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </Button>
                                    <span className="text-sm font-medium">{element.name}</span>
                                </div>
                                <Switch
                                    checked={element.enabled}
                                    onCheckedChange={() => toggleStructuralElement(element.id)}
                                    className="scale-75"
                                />
                            </div>
                        </CardHeader>
                        {!isCollapsed && (
                            <CardContent className="p-2 pt-0">
                                <div className="space-y-3">
                                    {/* Starred text box */}
                                    {isTextBoxStarred && (
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Text Content</Label>
                                            <Textarea
                                                value={element.content}
                                                onChange={(e) => updateStructuralElement(element.id, { content: e.target.value })}
                                                placeholder="Enter your prompt content here..."
                                                className="min-h-[60px] font-mono text-sm resize-y"
                                            />
                                        </div>
                                    )}

                                    {/* Starred controls */}
                                    {controls
                                        .filter(control => elementStarredControls.includes(control.element.name))
                                        .map((control) => {
                                            const currentValue = uiGlobalControlValues[control.element.name] ?? control.element.defaultValue;

                                            switch (control.element.type) {
                                                case 'text':
                                                    return (
                                                        <div key={control.element.name} className="space-y-1">
                                                            <Label htmlFor={control.element.name} className="text-xs">
                                                                {control.element.name}
                                                            </Label>
                                                            <Input
                                                                id={control.element.name}
                                                                type="text"
                                                                value={currentValue || ''}
                                                                onChange={(e) => handleControlChange(control.element.name, e.target.value)}
                                                                placeholder={control.element.defaultValue || ''}
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    );

                                                case 'select':
                                                    return (
                                                        <div key={control.element.name} className="space-y-1">
                                                            <Label htmlFor={control.element.name} className="text-xs">
                                                                {control.element.name}
                                                            </Label>
                                                            <Select
                                                                value={currentValue || control.element.defaultValue}
                                                                onValueChange={(value) => handleControlChange(control.element.name, value)}
                                                            >
                                                                <SelectTrigger className="text-sm">
                                                                    <SelectValue placeholder="Select an option" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {control.element.options?.map((option) => (
                                                                        <SelectItem key={option} value={option}>
                                                                            {option}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    );

                                                case 'slider':
                                                    const sliderValue = currentValue !== undefined && currentValue !== null
                                                        ? parseInt(String(currentValue))
                                                        : parseInt(control.element.defaultValue || '50');
                                                    return (
                                                        <div key={control.element.name} className="space-y-1">
                                                            <Label htmlFor={control.element.name} className="text-xs">
                                                                {control.element.name}: {sliderValue}
                                                            </Label>
                                                            <Slider
                                                                min={control.element.min || 0}
                                                                max={control.element.max || 100}
                                                                value={[sliderValue]}
                                                                onValueChange={(value) => handleControlChange(control.element.name, value[0])}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                    );

                                                case 'toggle':
                                                    return (
                                                        <div key={control.element.name} className="flex items-center space-x-2">
                                                            <Switch
                                                                id={control.element.name}
                                                                checked={!!currentValue}
                                                                onCheckedChange={(checked) => handleControlChange(control.element.name, checked)}
                                                                className="scale-75"
                                                            />
                                                            <Label htmlFor={control.element.name} className="text-xs font-medium">
                                                                {control.element.name}
                                                            </Label>
                                                        </div>
                                                    );

                                                default:
                                                    return null;
                                            }
                                        })}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}
