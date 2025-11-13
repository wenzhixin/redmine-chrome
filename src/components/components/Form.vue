<script>
import { h } from 'vue'

export default {
  name: 'Form',
  props: {
    // Define the element of form, for example div instead of form
    element: {
      type: String,
      default: 'form'
    },
    // Whether the form is horizontal
    horizontal: {
      type: Boolean,
      default: true
    },
    // Whether the from is inline
    inline: {
      type: Boolean,
      default: false
    },
    // Define the cols of the label, default value is `3`
    labelCols: {
      type: [Number, String],
      default: 3
    },
    // Define the cols of the input, default value is `7`
    inputCols: {
      type: [Number, String],
      default: 9
    },
    // Define media query device size, can be 'xs', 'sm', 'md' or 'lg'; 'md' as default
    colSize: {
      type: String,
      default: undefined,
      validator (val) {
        return ['xs', 'sm', 'md', 'lg'].includes(val)
      }
    }
  },
  emits: ['submit', 'reset'],
  computed: {
    classes () {
      if (this.inline) {
        return 'form-inline'
      }
      if (this.horizontal) {
        return 'form-horizontal'
      }
      return ''
    }
  },
  mounted () {
    window.$(this.$el).submit(event => {
      // Fire when the form submitted
      // @arg `event` Native submit event
      this.$emit('submit', event)
      return false
    })

    window.$(this.$el).on('reset', event => {
      // Fire when the form reset
      // @arg `event` Native submit event
      this.$emit('reset', event)
      return false
    })
  },
  render () {
    let slot = this.$slots.default

    if (typeof slot === 'function') {
      slot = slot()
    }
    return h(
      this.element,
      {
        ...this.$attrs,
        class: `${this.$attrs.class || ''} ${this.classes}`,
        ref: 'form'
      },
      slot
    )
  }
}
</script>

<style lang="scss" scoped>
.form-inline :deep(.form-group),
.form-inline :deep(.col-form-label),
.form-inline :deep(.form-control) {
  display: inline-block;
  width: auto;
  margin-right: 5px;
}

.form-inline :deep(.row > *) {
  width: auto;
}

.form-inline :deep(.form-group button) {
  vertical-align: baseline;
}
</style>
