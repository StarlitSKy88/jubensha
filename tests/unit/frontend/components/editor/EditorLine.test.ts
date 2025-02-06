import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EditorLine from '@/components/editor/EditorLine.vue'

describe('EditorLine', () => {
  const mockLine = {
    id: 'line-1',
    content: 'Test content'
  }
  
  const defaultProps = {
    line: mockLine,
    lineNumber: 1,
    isActive: false
  }
  
  let wrapper: ReturnType<typeof mount>
  
  beforeEach(() => {
    wrapper = mount(EditorLine, {
      props: defaultProps,
      global: {
        provide: {
          performanceMonitor: {
            startMeasure: vi.fn(),
            endMeasure: vi.fn()
          }
        }
      }
    })
  })
  
  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.editor-line').exists()).toBe(true)
    expect(wrapper.find('.line-number').text()).toBe('1')
    expect(wrapper.find('.content-text').text()).toBe('Test content')
  })
  
  it('applies active class when isActive is true', async () => {
    await wrapper.setProps({ isActive: true })
    expect(wrapper.classes()).toContain('is-active')
  })
  
  it('emits click event', async () => {
    await wrapper.find('.editor-line').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
  
  it('enters edit mode on double click', async () => {
    await wrapper.find('.content-text').trigger('dblclick')
    expect(wrapper.find('el-input').exists()).toBe(true)
    expect(wrapper.vm.isEditing).toBe(true)
    expect(wrapper.vm.editingContent).toBe('Test content')
  })
  
  it('exits edit mode and emits update on blur', async () => {
    await wrapper.find('.content-text').trigger('dblclick')
    const input = wrapper.find('el-input')
    await input.setValue('Updated content')
    await input.trigger('blur')
    
    expect(wrapper.vm.isEditing).toBe(false)
    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')[0]).toEqual(['Updated content'])
  })
  
  it('exits edit mode and emits update on enter', async () => {
    await wrapper.find('.content-text').trigger('dblclick')
    const input = wrapper.find('el-input')
    await input.setValue('Updated content')
    await input.trigger('keydown.enter')
    
    expect(wrapper.vm.isEditing).toBe(false)
    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')[0]).toEqual(['Updated content'])
  })
  
  it('exits edit mode without update on escape', async () => {
    await wrapper.find('.content-text').trigger('dblclick')
    const input = wrapper.find('el-input')
    await input.setValue('Updated content')
    await input.trigger('keydown.esc')
    
    expect(wrapper.vm.isEditing).toBe(false)
    expect(wrapper.emitted('update')).toBeFalsy()
    expect(wrapper.vm.editingContent).toBe('Test content')
  })
  
  it('measures performance when starting edit', async () => {
    const startMeasure = vi.fn()
    const endMeasure = vi.fn()
    
    wrapper = mount(EditorLine, {
      props: defaultProps,
      global: {
        provide: {
          performanceMonitor: {
            startMeasure,
            endMeasure
          }
        }
      }
    })
    
    await wrapper.find('.content-text').trigger('dblclick')
    
    expect(startMeasure).toHaveBeenCalledWith('start-editing')
    expect(endMeasure).toHaveBeenCalledWith('start-editing')
  })
  
  it('measures performance when finishing edit', async () => {
    const startMeasure = vi.fn()
    const endMeasure = vi.fn()
    
    wrapper = mount(EditorLine, {
      props: defaultProps,
      global: {
        provide: {
          performanceMonitor: {
            startMeasure,
            endMeasure
          }
        }
      }
    })
    
    await wrapper.find('.content-text').trigger('dblclick')
    const input = wrapper.find('el-input')
    await input.trigger('blur')
    
    expect(startMeasure).toHaveBeenCalledWith('finish-editing')
    expect(endMeasure).toHaveBeenCalledWith('finish-editing')
  })
  
  it('focuses input after entering edit mode', async () => {
    const focus = vi.fn()
    
    wrapper = mount(EditorLine, {
      props: defaultProps,
      global: {
        provide: {
          performanceMonitor: {
            startMeasure: vi.fn(),
            endMeasure: vi.fn()
          }
        }
      }
    })
    
    wrapper.vm.inputRef = { focus } as any
    
    await wrapper.find('.content-text').trigger('dblclick')
    await wrapper.vm.$nextTick()
    
    expect(focus).toHaveBeenCalled()
  })
}) 