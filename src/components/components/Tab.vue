<template>
  <component
    :is="element"
    :name="name"
    :class="classes"
    class="nav-item"
  >
    <slot v-if="!list" />
    <a
      v-if="list"
      href="#"
      class="nav-link"
      :class="classes"
      @click.prevent="onClick"
    >
      <img
        v-if="image"
        class="mr5"
        :src="image"
      >
      <slot>
        <span v-html="title" />
      </slot>
    </a>
  </component>
</template>

<script>
export default {
  name: 'Tab',
  props: {
    // The name of the tab
    name: {
      type: String,
      default: undefined
    },
    tabTitle: {
      type: Boolean,
      default: false
    },
    // The title of the tab
    title: {
      type: String,
      default: ''
    },
    // Whether to place the component in the active state
    active: {
      type: Boolean,
      default: false
    },
    // Whether to disable the tab
    disabled: {
      type: Boolean,
      default: false
    },
    // The image
    image: {
      type: String,
      default: undefined
    },
    // The hint
    hint: {
      type: String,
      default: undefined
    }
  },
  emits: ['click-tab'],
  data () {
    return {
      list: this.tabTitle,
      isActive: this.active
    }
  },
  computed: {
    element () {
      return this.list ? 'li' : 'div'
    },
    classes () {
      const classes = []

      if (this.list) {
        if (this.isActive) {
          classes.push('active')
        }
        if (this.disabled) {
          classes.push('disabled')
        }
      } else {
        classes.push('tab-pane', 'fade')

        if (this.isActive) {
          classes.push('in', 'active', 'show')
        }
      }

      return classes
    }
  },
  watch: {
    active () {
      this.isActive = this.active
    }
  },
  created () {
    if (this.tabTitle) {
      return
    }
    try {
      this.$parent.tabs.push(this)
      this.list = this.$parent.list
    } catch (e) {
      throw new Error(`<Tab> parent must be <Tabs>: ${e}`)
    }
  },
  beforeUnmount () {
    if (this.tabTitle) {
      return
    }
    const tabs = this.$parent?.tabs

    if (Array.isArray(tabs)) {
      const index = tabs.indexOf(this)

      if (index >= 0) {
        tabs.splice(index, 1)
      }
    }
  },
  methods: {
    onClick () {
      if (this.tabTitle) {
        return
      }
      if (typeof this.$parent.value === 'number') {
        this.$parent.onClick(this.$parent.tabs.indexOf(this))
      }
      // Fire when the tab is clicked
      this.$emit('click-tab')
    },
    toggleActive (active) {
      this.isActive = active
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-pane {
  padding: 0;
}
</style>
