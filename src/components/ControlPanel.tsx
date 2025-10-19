import { parseControlSyntax } from '@/utils/syntaxParser';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface ControlPanelProps {
    content: string;
    controlValues: Record<string, any>;
    onControlChange: (name: string, value: any) => void;
}

export function ControlPanel({ content, controlValues, onControlChange }: ControlPanelProps) {
    const controls = parseControlSyntax(content);

    if (controls.length === 0) {
        return (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    No dynamic controls found. Use <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{text:Name:Default}}'}</code> syntax to add controls.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-2">
            {controls.map((control) => {
                const currentValue = controlValues[control.element.name] ?? control.element.defaultValue;

                switch (control.element.type) {
                    case 'text':
                        return (
                            <div key={control.element.name} className="space-y-2">
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
                            <div key={control.element.name} className="space-y-2">
                                <Label htmlFor={control.element.name} className="text-xs">
                                    {control.element.name}
                                </Label>
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
                            </div>
                        );

                    case 'slider':
                        const sliderValue = parseInt(currentValue) || parseInt(control.element.defaultValue || '50');
                        return (
                            <div key={control.element.name} className="space-y-2">
                                <Label htmlFor={control.element.name} className="text-xs">
                                    {control.element.name}: {sliderValue}
                                </Label>
                                <Slider
                                    min={control.element.min || 0}
                                    max={control.element.max || 100}
                                    value={[sliderValue]}
                                    onValueChange={(value) => onControlChange(control.element.name, value[0])}
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
