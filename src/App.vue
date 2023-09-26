<template>
  <component :is="component" />
</template>

<script setup>
import { onMounted, shallowRef } from 'vue'
import Options from './views/Options.vue'
import Popup from './views/Popup.vue'
import Utils from './utils'

const component = shallowRef()

onMounted(async () => {
  window.locale = await Utils.getStorage('locale') || 'en-US'
  window.options = await Utils.getStorage('options') || {}

  Object.assign(window.jQuery.fn.multipleSelect.defaults, {
    ...window.jQuery.fn.multipleSelect.locales[window.locale === 'sp-SP' ? 'en-US' : window.locale]
  })

  component.value = {
    options: Options
  }[window.location.hash.split('#')[1]] || Popup
})
</script>
