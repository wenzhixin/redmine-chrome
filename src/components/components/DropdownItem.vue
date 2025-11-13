<template>
  <li
    :class="{ 'is-divider': divider }"
    @click="onClick"
  >
    <h6
      v-if="header"
      class="dropdown-header"
    >
      <slot />
    </h6>
    <hr
      v-if="divider"
      class="dropdown-divider"
    >
    <a
      v-if="!(header || divider)"
      :href="href"
      :target="target"
      :class="classes"
      class="dropdown-item"
    >
      <slot />
    </a>
  </li>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Whether to active the dropdown item
  active: {
    type: Boolean,
    default: false
  },
  // Whether to disable the dropdown item
  disabled: {
    type: Boolean,
    default: false
  },
  // Set dropdown item as a header
  header: {
    type: Boolean,
    default: false
  },
  // Set dropdown item as a divider
  divider: {
    type: Boolean,
    default: false
  },
  // The href of dropdown item
  href: {
    type: String,
    default: '#'
  },
  // The href target of dropdown item
  target: {
    type: String,
    default: undefined
  }
})
const classes = computed(() => {
  if (props.active) {
    return 'active'
  }
  if (props.disabled) {
    return 'disabled'
  }
  return ''
})
const onClick = e => {
  // Fire when the dropdown item clicked
  // @arg `event`
  if (props.disabled || props.active) {
    e.stopImmediatePropagation()
    return false
  }
}
</script>

<style scoped>
.is-divider {
  line-height: 0;
}
</style>
