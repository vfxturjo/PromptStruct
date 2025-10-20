import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StructuralElementCard } from '@/components/StructuralElementCard'
import { StructuralElement } from '@/types'

// Mock the drag-and-drop functionality
vi.mock('@dnd-kit/sortable', () => ({
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    }),
}))

vi.mock('@dnd-kit/utilities', () => ({
    CSS: {
        Transform: {
            toString: () => '',
        },
    },
}))

describe('StructuralElementCard', () => {
    const mockElement: StructuralElement = {
        id: 'test-1',
        name: 'Test Element',
        enabled: true,
        content: 'Test content with {{text:Name:Default}}'
    }

    const mockHandlers = {
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
        onToggle: vi.fn(),
        controlValues: {},
        onControlChange: vi.fn(),
        collapsed: { text: false, controls: false },
        onCollapsedChange: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render element name', () => {
        render(<StructuralElementCard element={mockElement} {...mockHandlers} />)

        expect(screen.getByDisplayValue('Test Element')).toBeInTheDocument()
    })

    it('should render element content', () => {
        render(<StructuralElementCard element={mockElement} {...mockHandlers} />)

        // Check that the contenteditable div contains the text
        const contentDiv = document.querySelector('[contenteditable="true"]')
        expect(contentDiv).toBeInTheDocument()
        expect(contentDiv?.textContent).toContain('Test content with {{text:Name:Default}}')
    })

    it('should show enabled state', () => {
        render(<StructuralElementCard element={mockElement} {...mockHandlers} />)

        const switchControl = screen.getByRole('switch')
        expect(switchControl).toHaveAttribute('aria-checked', 'true')
    })

    it('should show disabled state', () => {
        const disabledElement = { ...mockElement, enabled: false }
        render(<StructuralElementCard element={disabledElement} {...mockHandlers} />)

        const switchControl = screen.getByRole('switch')
        expect(switchControl).toHaveAttribute('aria-checked', 'false')
    })

    it('should call onUpdate when name changes', () => {
        render(<StructuralElementCard element={mockElement} {...mockHandlers} />)

        const nameInput = screen.getByDisplayValue('Test Element')
        fireEvent.change(nameInput, { target: { value: 'New Name' } })

        expect(mockHandlers.onUpdate).toHaveBeenCalledWith('test-1', { name: 'New Name' })
    })

    it('should call onUpdate when content changes', () => {
        render(<StructuralElementCard element={mockElement} {...mockHandlers} />)

        const contentDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
        expect(contentDiv).toBeInTheDocument()

        // Simulate content change
        contentDiv.textContent = 'New content'
        fireEvent.input(contentDiv)

        expect(mockHandlers.onUpdate).toHaveBeenCalledWith('test-1', { content: 'New content' })
    })

    it('should call onToggle when toggle is clicked', () => {
        render(<StructuralElementCard element={mockElement} {...mockHandlers} />)

        const switchControl = screen.getByRole('switch')
        fireEvent.click(switchControl)

        expect(mockHandlers.onToggle).toHaveBeenCalledWith('test-1')
    })

    it('should call onDelete when delete button clicked', () => {
        render(<StructuralElementCard element={mockElement} {...mockHandlers} />)

        const deleteButton = screen.getByRole('button', { name: /trash/i })
        fireEvent.click(deleteButton)

        expect(mockHandlers.onDelete).toHaveBeenCalledWith('test-1')
    })

    it('should render control panel for content with controls', () => {
        render(<StructuralElementCard element={mockElement} {...mockHandlers} />)

        // Should show the control panel with dynamic controls
        expect(screen.getByText('Dynamic Controls')).toBeInTheDocument()
    })

    it('should show no controls message for content without controls', () => {
        const elementWithoutControls = { ...mockElement, content: 'Simple text without controls' }
        render(<StructuralElementCard element={elementWithoutControls} {...mockHandlers} />)

        expect(screen.getByText(/No dynamic controls found/)).toBeInTheDocument()
    })
})
