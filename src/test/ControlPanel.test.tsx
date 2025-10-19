import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ControlPanel } from '@/components/ControlPanel'

describe('ControlPanel', () => {
    const mockOnControlChange = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show no controls message for content without controls', () => {
        render(
            <ControlPanel
                content="Simple text without any controls"
                controlValues={{}}
                onControlChange={mockOnControlChange}
            />
        )

        expect(screen.getByText(/No dynamic controls found/)).toBeInTheDocument()
    })

    it('should render text control', () => {
        render(
            <ControlPanel
                content="Hello {{text:Name:John}}!"
                controlValues={{}}
                onControlChange={mockOnControlChange}
            />
        )

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    })

    it('should render select control', () => {
        render(
            <ControlPanel
                content="Choose {{select:Genre:Fantasy|Sci-Fi|Mystery}}"
                controlValues={{}}
                onControlChange={mockOnControlChange}
            />
        )

        expect(screen.getByText('Genre')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Fantasy')).toBeInTheDocument()
    })

    it('should render slider control', () => {
        render(
            <ControlPanel
                content="Set {{slider:Creativity:75}}"
                controlValues={{}}
                onControlChange={mockOnControlChange}
            />
        )

        expect(screen.getByText('Creativity: 75')).toBeInTheDocument()
        expect(screen.getByRole('slider')).toBeInTheDocument()
    })

    it('should render toggle control', () => {
        render(
            <ControlPanel
                content="{{toggle:Include_Details}}Show details{{/toggle:Include_Details}}"
                controlValues={{}}
                onControlChange={mockOnControlChange}
            />
        )

        expect(screen.getByText('Include_Details')).toBeInTheDocument()
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render multiple controls', () => {
        render(
            <ControlPanel
                content="{{text:Name:John}} likes {{select:Genre:Fantasy|Sci-Fi}} with {{slider:Rating:50}}"
                controlValues={{}}
                onControlChange={mockOnControlChange}
            />
        )

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Genre')).toBeInTheDocument()
        expect(screen.getByText('Rating: 50')).toBeInTheDocument()
    })

    it('should call onControlChange when text input changes', () => {
        render(
            <ControlPanel
                content="Hello {{text:Name:John}}!"
                controlValues={{}}
                onControlChange={mockOnControlChange}
            />
        )

        const input = screen.getByDisplayValue('John')
        fireEvent.change(input, { target: { value: 'Alice' } })

        expect(mockOnControlChange).toHaveBeenCalledWith('Name', 'Alice')
    })

    it('should call onControlChange when select changes', () => {
        render(
            <ControlPanel
                content="Choose {{select:Genre:Fantasy|Sci-Fi|Mystery}}"
                controlValues={{}}
                onControlChange={mockOnControlChange}
            />
        )

        const select = screen.getByDisplayValue('Fantasy')
        fireEvent.change(select, { target: { value: 'Sci-Fi' } })

        expect(mockOnControlChange).toHaveBeenCalledWith('Genre', 'Sci-Fi')
    })

    it('should call onControlChange when slider changes', () => {
        render(
            <ControlPanel
                content="Set {{slider:Creativity:75}}"
                controlValues={{}}
                onControlChange={mockOnControlChange}
            />
        )

        const slider = screen.getByRole('slider')
        fireEvent.change(slider, { target: { value: '90' } })

        expect(mockOnControlChange).toHaveBeenCalledWith('Creativity', '90')
    })

    it('should use provided control values', () => {
        render(
            <ControlPanel
                content="Hello {{text:Name:John}}!"
                controlValues={{ Name: 'Alice' }}
                onControlChange={mockOnControlChange}
            />
        )

        expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
    })

    it('should handle nested controls in toggles', () => {
        render(
            <ControlPanel
                content="{{toggle:Show_Details}}Name: {{text:Character:Hero}}{{/toggle:Show_Details}}"
                controlValues={{}}
                onControlChange={mockOnControlChange}
            />
        )

        expect(screen.getByText('Show_Details')).toBeInTheDocument()
        // Should not show nested controls as separate controls
        expect(screen.queryByText('Character')).not.toBeInTheDocument()
    })
})
