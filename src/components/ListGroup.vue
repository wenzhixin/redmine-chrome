<template>
  <component
    :is="isLink ? 'div' : 'ul'"
    :class="type ? `list-group-${type}` : ''"
    class="list-group"
  >
    <slot
      :is-link="isLink"
    />
  </component>
</template>

<script>
export default {
  name: 'ListGroup',
  props: {
    // The type of list group, can be `''`, `'flush'`, `'numbered'`
    type: {
      type: String,
      default: ''
    },
    // Whether to use a link(`<a>`) as list group item
    isLink: {
      type: Boolean,
      default: false
    }
  }
}
</script>
