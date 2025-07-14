import debounce from "debounce"
import { onBeforeMount, onMounted, ref } from "vue"

export const useViewportSize = () => {
  const BREAKPOINTS = {
    TABLET: 768,
    LAPTOP_SM: 1280,
    LAPTOP: 1536,
    LAPTOP_LG: 1920,
  }

  const width = ref<number>(0)

  width.value = document.body.clientWidth
  window.addEventListener('resize', debounce(() => {
    width.value = document.body.clientWidth
  }, 250))

  return {
    BREAKPOINTS,
    width,
  }
}