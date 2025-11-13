<template>
  <button
    :class="classes"
    :disabled="disabled || loading"
    :type="buttonType"
    v-bind="attrs"
    @click="onClick"
  >
    <template v-if="!loading">
      <i
        v-if="icon"
        :class="icon"
      /> <slot />
    </template>
    <template v-else>
      <i class="fa fa-spinner fa-spin" />
      {{ loadingText }}
    </template>

    <i
      v-if="help"
      :data-hint="help"
      data-hint-html="true"
      data-hint-align="left"
      class="far fa-circle-question"
    />
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    // The type of button, can be one of `['primary', 'success', 'info', 'warning', 'danger', 'link']`
    type: {
      type: String,
      default: undefined
    },
    // The size of button, can be `'sm'` or `'lg'`
    size: {
      type: String,
      default: undefined
    },
    // Whether to disable the button
    disabled: {
      type: Boolean,
      default: false
    },
    // The vue router path of a page, for example: `'to="jobs"'`
    to: {
      type: String,
      default: undefined
    },
    // The hint tooltip
    hint: {
      type: String,
      default: undefined
    },
    // The fa icon, can be fa-*, fab-*, far-*, fd-*, bi-*, for example: `icon="fa-pen-to-square"`
    icon: {
      type: String,
      default: undefined
    },
    // The icon type, can be `'success'`, `'info'`, `'warning'` or `'danger'`
    iconType: {
      type: String,
      default: undefined
    },
    // The submit type of button
    submit: {
      type: Boolean,
      default: false
    },
    // The reset type of button
    reset: {
      type: Boolean,
      default: false
    },
    // Whether to show the loading
    loading: {
      type: Boolean,
      default: false
    },
    // The loading text when loading is `true`
    loadingText: {
      type: String,
      default: ''
    },
    // To show the link help icon
    help: {
      type: String,
      default: undefined
    },
    // Show outline type
    outline: {
      type: Boolean,
      default: false
    },
    // Show soft type
    soft: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  computed: {
    classes () {
      let type = this.type || 'secondary'

      if (type === 'default') {
        type = 'secondary'
      }

      return [
        'btn',
        `btn-${this.soft ? 'soft-' : ''}${type}`,
        this.size ? `btn-${this.size}` : '',
        this.outline ? 'btn-outline' : ''
      ].join(' ')
    },
    attrs () {
      return {
        'data-hint': this.hint
      }
    },
    buttonType () {
      if (this.submit) {
        return 'submit'
      }
      if (this.reset) {
        return 'reset'
      }
      return 'button'
    }
  },
  methods: {
    onClick (event) {
      // Native click event object
      // @arg `event`
      this.$emit('click', event)
    }
  }
}
</script>

<style scoped>
.btn-link {
  padding-left: 0;
  text-decoration: none;
}

.btn-outline {
  background: transparent;
}
</style>
