<template>
  <component
    :is="isLink ? 'a' : 'li'"
    :href="isLink ? 'javaScript:' : undefined"
    :class="classes"
    @click="onClick"
  >
    <slot />
  </component>
</template>

<script>
export default {
  name: 'ListGroupItem',
  props: {
    // The type of list group item, can be `''`, `'primary'` `'secondary'` `'success'`, `'warning'`, `'danger'`, `'info'`, `'light'`, or `'dark'`
    type: {
      type: String,
      default: ''
    },
    // Whether to disable the list group item
    disabled: {
      type: Boolean,
      default: false
    },
    // Whether add active to the list group item
    active: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  data () {
    return {
      isLink: false
    }
  },
  computed: {
    classes () {
      return [
        'list-group-item',
        this.type ? `list-group-item-${this.type}` : '',
        this.disabled ? 'disabled' : '',
        this.active ? 'active' : '',
        this.isLink ? 'list-group-item-action' : ''
      ].join(' ')
    }
  },
  mounted () {
    this.isLink = $(this.$el).parent().is('div')
  },
  methods: {
    onClick (e) {
      if (this.isLink) {
        // Fire by clicking on a list group item `'isLink'` is true
        // @arg `event`
        this.$emit('click', e)
      }
    }
  }
}
</script>
