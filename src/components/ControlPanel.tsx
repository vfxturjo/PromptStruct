import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Typography } from '@/components/ui/typography';
import { parseControlSyntax } from '@/utils/syntaxParser';

interface ControlPanelProps {
    content: string;
    controlValues: Record<string, any>;
    onControlChange: (name: string, value: any) => void;
}

export function ControlPanel({ content, controlValues, onControlChange }: ControlPanelProps) {
    const controls = parseControlSyntax(content);

    if (controls.length === 0) {
        return (
            <div className="p-2">
                <Typography variant="muted">
                    No dynamic controls found. Use <Typography variant="inlineCode">{'{{text:Name:Default}}'}</Typography> syntax to add controls.
                </Typography>
            </div>
        );
    }

    return (
        <div className="p-3 border-t">
            <Typography variant="h4" className="text-sm font-medium text-muted-foreground">Dynamic Controls</Typography>
            {controls.map((control) => {
                const currentValue = controlValues[control.element.name] ?? control.element.defaultValue;

                switch (control.element.type) {
                    case 'text':
                        return (
                            <div key={control.element.name}>
                                <Typography variant="small" className="text-muted-foreground">
                                    {control.element.name}
                                </Typography>
                                <Input
                                    value={currentValue || ''}
                                    onChange={(e) => onControlChange(control.element.name, e.target.value)}
                                    placeholder={control.element.defaultValue || ''}
                                    className="text-sm"
                                />
                            </div>
                        );

                    case 'select':
                        return (
                            <div key={control.element.name}>
                                <Typography variant="small" className="text-muted-foreground">
                                    {control.element.name}
                                </Typography>
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
                            <div key={control.element.name}>
                                <Typography variant="small" className="text-muted-foreground">
                                    {control.element.name}: {sliderValue}
                                </Typography>
                                <input
                                    type="range"
                                    min={control.element.min || 0}
                                    max={control.element.max || 100}
                                    value={sliderValue}
                                    onChange={(e) => onControlChange(control.element.name, e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        );

                    case 'toggle':
                        return (
                            <div key={control.element.name}>
                                <div className="flex items-center gap-2">
                                    <Toggle
                                        pressed={!!currentValue}
                                        onPressedChange={(pressed) => onControlChange(control.element.name, pressed)}
                                    />
                                    <label className="text-xs font-medium text-muted-foreground">
                                        {control.element.name}
                                    </label>
                                </div>
                            </div>
                        );

                    default:
                        return null;
                }
            })}
        </div>
    );
}
