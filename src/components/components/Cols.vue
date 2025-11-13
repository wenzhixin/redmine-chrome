<template>
  <div :class="`col-${size}-${cols}`">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Cols',
  props: {
    // The cols of the col-md
    cols: {
      type: [Number, String],
      default: 6
    },
    size: {
      type: String,
      default: 'md',
      validator: val => ['xs', 'sm', 'md', 'lg'].includes(val)
    }
  }
}
</script>
