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
            <div style={{ padding: '8px' }}>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    No dynamic controls found. Use <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>{'{{text:Name:Default}}'}</code> syntax to add controls.
                </p>
            </div>
        );
    }

    return (
        <div style={{ padding: '12px', borderTop: '1px solid #ccc' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '500', color: '#666' }}>Dynamic Controls</h4>
            {controls.map((control) => {
                const currentValue = controlValues[control.element.name] ?? control.element.defaultValue;

                switch (control.element.type) {
                    case 'text':
                        return (
                            <div key={control.element.name} style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                    {control.element.name}
                                </label>
                                <input
                                    type="text"
                                    value={currentValue || ''}
                                    onChange={(e) => onControlChange(control.element.name, e.target.value)}
                                    placeholder={control.element.defaultValue || ''}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        );

                    case 'select':
                        return (
                            <div key={control.element.name} style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                    {control.element.name}
                                </label>
                                <select
                                    value={currentValue || control.element.defaultValue}
                                    onChange={(e) => onControlChange(control.element.name, e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">Select an option</option>
                                    {control.element.options?.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );

                    case 'slider':
                        const sliderValue = parseInt(currentValue) || parseInt(control.element.defaultValue || '50');
                        return (
                            <div key={control.element.name} style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                    {control.element.name}: {sliderValue}
                                </label>
                                <input
                                    type="range"
                                    min={control.element.min || 0}
                                    max={control.element.max || 100}
                                    value={sliderValue}
                                    onChange={(e) => onControlChange(control.element.name, e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        );

                    case 'toggle':
                        return (
                            <div key={control.element.name} style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!currentValue}
                                        onChange={(e) => onControlChange(control.element.name, e.target.checked)}
                                        style={{ transform: 'scale(1.2)' }}
                                    />
                                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>
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
