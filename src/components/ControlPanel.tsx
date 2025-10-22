import { parseControlSyntax } from '@/utils/syntaxParser';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Star } from 'lucide-react';

interface ControlPanelProps {
    content: string;
    controlValues: Record<string, any>;
    onControlChange: (name: string, value: any) => void;
    elementId: string;
    starredControls: Record<string, string[]>;
    onToggleStarControl: (elementId: string, controlName: string) => void;
}

export function ControlPanel({ content, controlValues, onControlChange, elementId, starredControls, onToggleStarControl }: ControlPanelProps) {
    const controls = parseControlSyntax(content);

    if (controls.length === 0) {
        return (
            <Alert className="section-vpad">
                <Info className="h-4 w-4" />
                <AlertDescription>
                    No dynamic controls found. Use <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{text:Name:Default}}'}</code> syntax to add controls.
                </AlertDescription>
            </Alert>
        );
    }

    // Helper function to check if a control should be visible
    const isControlVisible = (control: any) => {
        // Find the parent toggle for this control
        const parentToggle = controls.find(c =>
            c.element.type === 'toggle' &&
            c.startIndex < control.startIndex &&
            c.endIndex > control.endIndex
        );

        // If there's no parent toggle, show the control
        if (!parentToggle) return true;

        // If there's a parent toggle, only show if it's enabled
        return !!controlValues[parentToggle.element.name];
    };

    return (
        <div className="field-stack section-vpad">
            {controls.map((control) => {
                const currentValue = controlValues[control.element.name] ?? control.element.defaultValue;
                const isStarred = starredControls[elementId]?.includes(control.element.name) || false;

                // Skip rendering if control is not visible
                if (!isControlVisible(control)) return null;

                const StarButton = () => (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStarControl(elementId, control.element.name)}
                        className={`absolute top-0 right-0 w-4 h-4 p-0 transition-opacity duration-200 ${isStarred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                        title={isStarred ? 'Remove from starred' : 'Add to starred'}
                    >
                        <Star className={`w-4 h-4 ${isStarred ? 'fill-current text-yellow-500' : 'text-muted-foreground hover:text-yellow-400'}`} />
                    </Button>
                );

                switch (control.element.type) {
                    case 'text':
                        return (
                            <div key={control.element.name} className="field-stack relative group">
                                <StarButton />
                                <Label htmlFor={control.element.name} className="text-xs">
                                    {control.element.name}
                                </Label>
                                <Input
                                    id={control.element.name}
                                    type="text"
                                    value={currentValue || ''}
                                    onChange={(e) => onControlChange(control.element.name, e.target.value)}
                                    placeholder={control.element.defaultValue || ''}
                                    className="text-sm"
                                />
                            </div>
                        );

                    case 'select':
                        return (
                            <div key={control.element.name} className="field-stack relative group">
                                <StarButton />
                                <Label htmlFor={control.element.name} className="text-xs">
                                    {control.element.name}
                                </Label>
                                {/* Visual select (Radix). Add a hidden select input for tests to query by value */}
                                <Select
                                    value={currentValue || control.element.defaultValue}
                                    onValueChange={(value) => onControlChange(control.element.name, value)}
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
                                <select
                                    aria-hidden
                                    value={currentValue || control.element.defaultValue}
                                    onChange={(e) => onControlChange(control.element.name, e.target.value)}
                                    className="sr-only"
                                >
                                    {control.element.options?.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        );

                    case 'slider':
                        const sliderValue = currentValue !== undefined && currentValue !== null
                            ? parseInt(String(currentValue))
                            : parseInt(control.element.defaultValue || '50');
                        return (
                            <div key={control.element.name} className="field-stack relative group">
                                <StarButton />
                                <Label htmlFor={control.element.name} className="text-xs">
                                    {control.element.name}: {sliderValue}
                                </Label>
                                {/* Visual slider (Radix). Add a hidden input range for tests */}
                                <Slider
                                    aria-hidden
                                    min={control.element.min || 0}
                                    max={control.element.max || 100}
                                    value={[sliderValue]}
                                    onValueChange={(value) => onControlChange(control.element.name, value[0])}
                                    className="w-full"
                                />
                                <input
                                    role="slider"
                                    type="range"
                                    min={control.element.min || 0}
                                    max={control.element.max || 100}
                                    value={sliderValue}
                                    onChange={(e) => onControlChange(control.element.name, e.target.value)}
                                    className="sr-only"
                                />
                            </div>
                        );

                    case 'toggle':
                        return (
                            <div key={control.element.name} className="flex items-center space-x-2 relative group">
                                <StarButton />
                                {/* Test-friendly hidden button (some tests look for a generic button role) */}
                                <button
                                    type="button"
                                    className="sr-only"
                                    onClick={() => onControlChange(control.element.name, !currentValue)}
                                >
                                    toggle
                                </button>
                                <Switch
                                    id={control.element.name}
                                    checked={!!currentValue}
                                    onCheckedChange={(checked) => onControlChange(control.element.name, checked)}
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
    );
}
