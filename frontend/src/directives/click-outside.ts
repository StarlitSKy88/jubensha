import { Directive } from 'vue'

export const vClickOutside: Directive = {
  mounted(el, binding) {
    el._clickOutside = (event: Event) => {
      // 检查点击事件是否发生在元素外部
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}

// 为了TypeScript支持，扩展Window接口
declare global {
  interface HTMLElement {
    _clickOutside: (event: Event) => void
  }
} 