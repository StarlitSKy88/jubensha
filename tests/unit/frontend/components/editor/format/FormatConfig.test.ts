import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormatConfig from '../../../../src/components/editor/format/FormatConfig.vue'
import { nextTick } from 'vue'

describe('FormatConfig', () => {
  // 创建测试实例
  const createWrapper = (props = {}) => {
    return mount(FormatConfig, {
      props: {
        visible: true,
        type: 'indent',
        modelValue: {
          sceneIndent: 0,
          characterIndent: 2,
          dialogIndent: 4,
          actionIndent: 2
        },
        ...props
      }
    })
  }

  // 测试组件渲染
  it('should render correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.format-config').exists()).toBe(true)
    expect(wrapper.find('.preview').exists()).toBe(true)
  })

  // 测试缩进配置
  it('should handle indent configuration', async () => {
    const wrapper = createWrapper({
      type: 'indent',
      modelValue: {
        sceneIndent: 0,
        characterIndent: 2,
        dialogIndent: 4,
        actionIndent: 2
      }
    })

    // 修改场景缩进
    const sceneInput = wrapper.find('[data-test="scene-indent"]')
    await sceneInput.setValue(4)

    // 验证更新事件
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({
      sceneIndent: 4,
      characterIndent: 2,
      dialogIndent: 4,
      actionIndent: 2
    })

    // 验证预览更新
    await nextTick()
    const preview = wrapper.find('.preview-content').text()
    expect(preview).toContain('    场景标题')
  })

  // 测试大小写配置
  it('should handle case configuration', async () => {
    const wrapper = createWrapper({
      type: 'case',
      modelValue: {
        sceneCase: 'normal',
        characterCase: 'normal',
        transitionCase: 'normal'
      }
    })

    // 修改场景大小写
    const sceneSelect = wrapper.find('[data-test="scene-case"]')
    await sceneSelect.setValue('upper')

    // 验证更新事件
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({
      sceneCase: 'upper',
      characterCase: 'normal',
      transitionCase: 'normal'
    })

    // 验证预览更新
    await nextTick()
    const preview = wrapper.find('.preview-content').text()
    expect(preview).toContain('内景 咖啡厅 - 日'.toUpperCase())
  })

  // 测试宽度配置
  it('should handle width configuration', async () => {
    const wrapper = createWrapper({
      type: 'width',
      modelValue: {
        dialogWidth: 35,
        actionWidth: 60
      }
    })

    // 修改对话宽度
    const dialogInput = wrapper.find('[data-test="dialog-width"]')
    await dialogInput.setValue(20)

    // 验证更新事件
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({
      dialogWidth: 20,
      actionWidth: 60
    })

    // 验证预览更新
    await nextTick()
    const preview = wrapper.find('.preview-content').text()
    expect(preview.split('\n')[1].length).toBeLessThanOrEqual(20)
  })

  // 测试行距配置
  it('should handle spacing configuration', async () => {
    const wrapper = createWrapper({
      type: 'spacing',
      modelValue: {
        sceneSpacing: 2,
        dialogSpacing: 1,
        actionSpacing: 1
      }
    })

    // 修改场景间距
    const sceneInput = wrapper.find('[data-test="scene-spacing"]')
    await sceneInput.setValue(3)

    // 验证更新事件
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({
      sceneSpacing: 3,
      dialogSpacing: 1,
      actionSpacing: 1
    })

    // 验证预览更新
    await nextTick()
    const preview = wrapper.find('.preview-content').text()
    const lines = preview.split('\n')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('')
    expect(lines[3]).toBe('')
  })

  // 测试重置功能
  it('should handle reset', async () => {
    const wrapper = createWrapper({
      type: 'indent',
      modelValue: {
        sceneIndent: 4,
        characterIndent: 4,
        dialogIndent: 6,
        actionIndent: 4
      }
    })

    // 点击重置按钮
    const resetButton = wrapper.find('[data-test="reset-button"]')
    await resetButton.trigger('click')

    // 验证更新事件
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({
      sceneIndent: 0,
      characterIndent: 2,
      dialogIndent: 4,
      actionIndent: 2
    })
  })

  // 测试确认功能
  it('should handle confirm', async () => {
    const wrapper = createWrapper()

    // 点击确认按钮
    const confirmButton = wrapper.find('[data-test="confirm-button"]')
    await confirmButton.trigger('click')

    // 验证确认事件
    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('update:visible')?.[0][0]).toBe(false)
  })
}) 