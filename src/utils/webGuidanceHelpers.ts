// ============================================================================
// TIỆN ÍCH FALLBACK THEO TIÊU CHUẨN MODERN WEB GUIDANCE
// 1. light-dismiss-a-dialog: Fallback cho <dialog closedby="any">
// 2. validate-input-after-interaction: Fallback cho :user-invalid & đồng bộ aria-invalid
// ============================================================================

/**
 * Fallback light-dismiss cho trình duyệt chưa hỗ trợ thuộc tính `closedby="any"` trên <dialog>
 */
export function attachDialogLightDismissFallback(dialog: HTMLDialogElement | null) {
  if (!dialog) return

  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const onClick = (event: MouseEvent) => {
      // 1. Khi click vào backdrop, event.target là chính phần tử dialog
      if (event.target !== dialog) return

      // 2. Kiểm tra tọa độ click có nằm trong vùng content box của dialog không
      const rect = dialog.getBoundingClientRect()
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width

      if (isDialogContent) return

      // 3. Click nằm ngoài vùng nội dung (trên backdrop) -> đóng dialog
      dialog.close()
    }

    dialog.addEventListener('click', onClick)
    return () => dialog.removeEventListener('click', onClick)
  }
  return undefined
}

/**
 * Tiện ích khởi tạo fallback `:user-invalid` (dùng WeakMap) và đồng bộ thuộc tính `aria-invalid`
 */
export function setupFormValidationEnhancements(root: Document | HTMLElement = document) {
  const dirtyState = new WeakMap<Element, { hasInteracted: boolean; hasBlurred: boolean }>()

  const syncAria = (el: EventTarget | null) => {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) {
      return
    }
    try {
      if (CSS.supports('selector(:user-invalid)')) {
        el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false')
      }
    } catch {
      // Ignore if selector check unsupported
    }
  }

  const updateFallbackState = (input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
    const isValid = input.checkValidity()
    input.classList.toggle('user-invalid-fallback', !isValid)
    input.classList.toggle('user-valid-fallback', isValid)
    if (!isValid) {
      input.setAttribute('aria-invalid', 'true')
    } else {
      input.removeAttribute('aria-invalid')
    }
  }

  const handleFallbackEvent = (event: Event) => {
    const target = event.target
    if (event.type === 'reset' && target instanceof HTMLFormElement) {
      const controls = Array.from(target.elements)
      for (const control of controls) {
        dirtyState.delete(control)
        control.classList.remove('user-invalid-fallback', 'user-valid-fallback')
        control.removeAttribute('aria-invalid')
      }
      return
    }

    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
      return
    }

    if (event.type === 'input' || event.type === 'change') {
      const state = dirtyState.get(target) || { hasInteracted: false, hasBlurred: false }
      state.hasInteracted = true
      dirtyState.set(target, state)
      if (state.hasBlurred) {
        updateFallbackState(target)
      }
    } else if (event.type === 'blur') {
      const state = dirtyState.get(target) || { hasInteracted: false, hasBlurred: false }
      state.hasBlurred = true
      dirtyState.set(target, state)
      if (state.hasInteracted) {
        updateFallbackState(target)
      }
    }
  }

  const onBlurSync = (e: Event) => syncAria(e.target)
  const onInputSync = (e: Event) => {
    if (e.target instanceof Element && e.target.hasAttribute('aria-invalid')) {
      syncAria(e.target)
    }
  }

  root.addEventListener('blur', onBlurSync, true)
  root.addEventListener('input', onInputSync)

  const supportsUserInvalid = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('selector(:user-invalid)')
  if (!supportsUserInvalid) {
    root.addEventListener('blur', handleFallbackEvent, true)
    root.addEventListener('input', handleFallbackEvent)
    root.addEventListener('change', handleFallbackEvent)
    root.addEventListener('reset', handleFallbackEvent, true)
  }

  return () => {
    root.removeEventListener('blur', onBlurSync, true)
    root.removeEventListener('input', onInputSync)
    if (!supportsUserInvalid) {
      root.removeEventListener('blur', handleFallbackEvent, true)
      root.removeEventListener('input', handleFallbackEvent)
      root.removeEventListener('change', handleFallbackEvent)
      root.removeEventListener('reset', handleFallbackEvent, true)
    }
  }
}
