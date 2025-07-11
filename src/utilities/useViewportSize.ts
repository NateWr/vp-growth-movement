import debounce from "debounce"
import { onMounted, ref } from "vue"

export const useViewportSize = () => {
  const BREAKPOINTS = {
    LAPTOP_SM: 1280
  }

  const width = ref<Number>(0)

  onMounted(() => {
    width.value = document.body.clientWidth
    window.addEventListener('resize', debounce(() => {
      width.value = document.body.clientWidth
    }, 250))
  })

  return {
    BREAKPOINTS,
    width,
  }
}