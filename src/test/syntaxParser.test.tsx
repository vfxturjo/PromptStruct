import { describe, it, expect } from 'vitest'
import { parseControlSyntax, renderPrompt } from '@/utils/syntaxParser'

describe('Syntax Parser', () => {
    describe('parseControlSyntax', () => {
        it('should parse text controls', () => {
            const content = 'Hello {{text:Name:John}}!'
            const controls = parseControlSyntax(content)

            expect(controls).toHaveLength(1)
            expect(controls[0].element.type).toBe('text')
            expect(controls[0].element.name).toBe('Name')
            expect(controls[0].element.defaultValue).toBe('John')
        })

        it('should parse select controls', () => {
            const content = 'Choose {{select:Genre:Fantasy|Sci-Fi|Mystery}}'
            const controls = parseControlSyntax(content)

            expect(controls).toHaveLength(1)
            expect(controls[0].element.type).toBe('select')
            expect(controls[0].element.name).toBe('Genre')
            expect(controls[0].element.options).toEqual(['Fantasy', 'Sci-Fi', 'Mystery'])
            expect(controls[0].element.defaultValue).toBe('Fantasy')
        })

        it('should parse slider controls', () => {
            const content = 'Set {{slider:Creativity:75}}'
            const controls = parseControlSyntax(content)

            expect(controls).toHaveLength(1)
            expect(controls[0].element.type).toBe('slider')
            expect(controls[0].element.name).toBe('Creativity')
            expect(controls[0].element.defaultValue).toBe('75')
            expect(controls[0].element.min).toBe(0)
            expect(controls[0].element.max).toBe(100)
        })

        it('should parse toggle controls', () => {
            const content = '{{toggle:Include_Details}}Show extra details{{/toggle:Include_Details}}'
            const controls = parseControlSyntax(content)

            expect(controls).toHaveLength(1)
            expect(controls[0].element.type).toBe('toggle')
            expect(controls[0].element.name).toBe('Include_Details')
            expect(controls[0].content).toBe('Show extra details')
        })

        it('should parse multiple controls', () => {
            const content = '{{text:Name:John}} likes {{select:Genre:Fantasy|Sci-Fi}} with {{slider:Rating:50}}'
            const controls = parseControlSyntax(content)

            expect(controls).toHaveLength(3)
            expect(controls[0].element.type).toBe('text')
            expect(controls[1].element.type).toBe('select')
            expect(controls[2].element.type).toBe('slider')
        })

        it('should handle nested controls in toggles', () => {
            const content = '{{toggle:Show_Details}}Name: {{text:Character:Hero}}{{/toggle:Show_Details}}'
            const controls = parseControlSyntax(content)

            expect(controls).toHaveLength(1)
            expect(controls[0].element.type).toBe('toggle')
            expect(controls[0].content).toBe('Name: {{text:Character:Hero}}')
        })
    })

    describe('renderPrompt', () => {
        it('should render text controls', () => {
            const content = 'Hello {{text:Name:John}}!'
            const controls = parseControlSyntax(content)
            const values = { Name: 'Alice' }

            const result = renderPrompt(content, controls, values)
            expect(result).toBe('Hello Alice!')
        })

        it('should render select controls', () => {
            const content = 'Choose {{select:Genre:Fantasy|Sci-Fi|Mystery}}'
            const controls = parseControlSyntax(content)
            const values = { Genre: 'Sci-Fi' }

            const result = renderPrompt(content, controls, values)
            expect(result).toBe('Choose Sci-Fi')
        })

        it('should render slider controls', () => {
            const content = 'Set {{slider:Creativity:75}}'
            const controls = parseControlSyntax(content)
            const values = { Creativity: '90' }

            const result = renderPrompt(content, controls, values)
            expect(result).toBe('Set 90')
        })

        it('should render toggle controls when enabled', () => {
            const content = '{{toggle:Include_Details}}Show extra details{{/toggle:Include_Details}}'
            const controls = parseControlSyntax(content)
            const values = { Include_Details: true }

            const result = renderPrompt(content, controls, values)
            expect(result).toBe('Show extra details')
        })

        it('should hide toggle controls when disabled', () => {
            const content = '{{toggle:Include_Details}}Show extra details{{/toggle:Include_Details}}'
            const controls = parseControlSyntax(content)
            const values = { Include_Details: false }

            const result = renderPrompt(content, controls, values)
            expect(result).toBe('')
        })

        it('should use default values when no values provided', () => {
            const content = 'Hello {{text:Name:John}}!'
            const controls = parseControlSyntax(content)
            const values = {}

            const result = renderPrompt(content, controls, values)
            expect(result).toBe('Hello John!')
        })

        it('should handle complex multi-control prompts', () => {
            const content = '{{text:Character:Hero}} in {{select:Genre:Fantasy|Sci-Fi}} with {{slider:Power:50}} power'
            const controls = parseControlSyntax(content)
            const values = { Character: 'Wizard', Genre: 'Fantasy', Power: '80' }

            const result = renderPrompt(content, controls, values)
            expect(result).toBe('Wizard in Fantasy with 80 power')
        })
    })
})
