import { VNode, VNodeDirective } from 'vue/types/vnode'

interface LongPressHTMLElement extends HTMLElement {
  $_long_press_pointerdown_handler : () => void;
  dataset : {
    longPressTimeoutId : string;
  };
}

const longPressStop = new CustomEvent('long-press-stop')
const longPressStart = new CustomEvent('long-press-start')

export const directiveOption = {
  bind (el: LongPressHTMLElement, binding: VNodeDirective, vnode: VNode) {
    el.dataset.longPressTimeoutId = ''

    const onpointerup = () => {
      clearTimeout(parseInt(el.dataset.longPressTimeoutId))

      if (vnode.componentInstance) {
        vnode.componentInstance.$emit('long-press-stop')
      } else {
        el.dispatchEvent(longPressStop)
      }

      document.removeEventListener('pointerup', onpointerup)
    }

    const onpointerdown = () => {
      document.addEventListener('pointerup', onpointerup)

      const timeout = setTimeout(() => {
        if (vnode.componentInstance) {
          vnode.componentInstance.$emit('long-press-start')
        } else {
          el.dispatchEvent(longPressStart)
        }
      }, binding.value)

      el.dataset.longPressTimeoutId = timeout.toString()
    }

    el.$_long_press_pointerdown_handler = onpointerdown;
    el.addEventListener('pointerdown', onpointerdown)
  },
  /**
   * NOTE: since unbind usually involes removing the element
   * just remove all pointerdown listener on the element
   *
   * If you are using the pointerdown event and unbinding this directive,
   * your pointerdown event may be removed
   */
  unbind (el : LongPressHTMLElement) {
    clearTimeout(parseInt(el.dataset.longPressTimeoutId))
    el.removeEventListener('pointerdown', el.$_long_press_pointerdown_handler)
  }
}

export default directiveOption
