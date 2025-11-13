<template>
  <div
    :class="[{ 'has-error': error || hasErrorSlot }, wrapperClasses]"
    class="form-group"
  >
    <label
      :class="labelClasses"
      v-bind="attrs"
      class="col-form-label"
    >
      <!-- The label slot of group -->
      <slot name="label">
        {{ label }}
      </slot>
      <template v-if="help">
        <a
          v-if="helpIsLink"
          href="#"
          @click.prevent="$emit('help-click')"
        >
          <i
            :data-hint="help"
            data-hint-html="true"
            class="far fa-circle-question"
          />
        </a>
        <i
          v-else
          :data-hint="help"
          data-hint-html="true"
          class="far fa-circle-question"
        />
      </template>
    </label>

    <div
      v-if="!inline"
      class="controls"
      :class="[inputClasses, { 'control-text': isText }]"
    >
      <div
        v-if="addonLeft || addonRight || hasAddonSlot"
        class="input-group"
      >
        <span
          v-if="addonLeft"
          class="input-group-text"
        >
          {{ addonLeft }}
        </span>

        <slot />

        <span
          v-if="addonRight && !hasAddonSlot"
          class="input-group-text"
        >
          {{ addonRight }}
        </span>

        <span
          v-if="hasAddonSlot"
          :class="addonClasses"
        >
          <slot name="addon" />
        </span>

        <span
          v-if="hasAddonRightSlot"
          :class="addonRightClasses"
        >
          <slot name="addon-right" />
        </span>
      </div>
      <slot v-else />

      <span
        v-if="error"
        class="invalid-feedback"
        v-html="error"
      />

      <span
        v-if="!error && hasErrorSlot"
        class="invalid-feedback"
      >
        <slot name="error" />
      </span>

      <span
        v-if="!error && description"
        class="form-text"
        v-html="description"
      />

      <span
        v-if="!error && !description && hasDescriptionSlot"
        class="form-text"
      >
        <slot name="description" />
      </span>
    </div>

    <template v-else>
      <div
        v-if="addonLeft || addonRight || hasAddonSlot"
        class="input-group"
      >
        <span
          v-if="addonLeft"
          class="input-group-text"
        >
          {{ addonLeft }}
        </span>

        <slot />

        <span
          v-if="addonRight && !hasAddonSlot"
          class="input-group-text"
        >
          {{ addonRight }}
        </span>

        <span
          v-if="hasAddonSlot"
          :class="addonClasses"
        >
          <!-- The addon slot of form group -->
          <slot name="addon" />
        </span>

        <span
          v-if="hasAddonRightSlot"
          :class="addonRightClasses"
        >
          <!-- The addon slot right of form group -->
          <slot name="addon-right" />
        </span>
      </div>
      <slot v-else />

      <span
        v-if="error"
        class="invalid-feedback"
        v-html="error"
      />

      <span
        v-if="!error && hasErrorSlot"
        class="invalid-feedback"
      >
        <slot name="error" />
      </span>

      <span
        v-if="!error && description"
        class="form-text"
        v-html="description"
      />

      <span
        v-if="!error && !description && hasDescriptionSlot"
        class="form-text"
      >
        <slot name="description" />
      </span>
    </template>
  </div>
</template>

<script>
export default {
  name: 'FormGroup',
  props: {
    // The label of form group
    label: {
      type: String,
      default: ''
    },
    // Whether is text of the input
    isText: {
      type: Boolean,
      default: false
    },
    // The for of form group label
    for: {
      type: String,
      default: ''
    },
    // Show the error of form group
    error: {
      type: [String, Boolean],
      default: ''
    },
    // Show the required style of form group
    required: {
      type: Boolean,
      default: false
    },
    // To show the input help block
    description: {
      type: String,
      default: ''
    },
    // To show the input help icon
    help: {
      type: String,
      default: undefined
    },
    // Whether is link of the help
    helpIsLink: {
      type: Boolean,
      default: false
    },
    // Define the cols of the label, default value is same as parent
    labelCols: {
      type: [Number, String],
      default: undefined
    },
    // Define the cols of the input, default value is same as parent
    inputCols: {
      type: [Number, String],
      default: undefined
    },
    // Define media query device size, can be 'xs', 'sm', 'md' or 'lg'; 'md' as default
    colSize: {
      type: String,
      default: undefined,
      validator (val) {
        return ['xs', 'sm', 'md', 'lg'].includes(val)
      }
    },
    // Define the left input group addon
    addonLeft: {
      type: String,
      default: undefined
    },
    // Define the right input group addon
    addonRight: {
      type: String,
      default: undefined
    },
    // Define whether the addon is button
    addonIsButton: {
      type: Boolean,
      default: true
    },
    // Define whether the addon right is button
    addonRightIsButton: {
      type: Boolean,
      default: false
    },
    // Whether has addon slot
    hasAddonSlot: {
      type: Boolean,
      default: false
    },
    // Whether has addon right slot
    hasAddonRightSlot: {
      type: Boolean,
      default: false
    },
    // Whether has Description slot
    hasDescriptionSlot: {
      type: Boolean,
      default: false
    }
  },
  emits: ['help-click'],
  data () {
    return {
      wrapperClasses: '',
      labelClasses: '',
      inputClasses: '',
      inline: false,
      fullCol: false,
      hasErrorSlot: false
    }
  },
  computed: {
    attrs () {
      if (this.for) {
        return {
          for: this.for
        }
      }
      return {}
    },
    addonClasses () {
      return {
        'has-input-group-addon': this.hasAddonRightSlot,
        'input-group-btn': this.addonIsButton,
        'input-group-addon': !this.addonIsButton
      }
    },
    addonRightClasses () {
      return {
        'input-group-btn': this.addonRightIsButton,
        'input-group-text': !this.addonRightIsButton
      }
    }
  },
  mounted () {
    if (!this.labelCols || !this.inputCols) {
      const $parent = this.getParentForm()

      if ($parent) {
        this.inline = $parent.inline

        if ($parent.horizontal && !$parent.inline) {
          this.setColClass($parent)
        }
      }
    } else {
      this.setColClass()
    }
    this.checkErrorSlot()
  },
  updated () {
    this.checkErrorSlot()
  },
  methods: {
    setColClass ($parent = null) {
      const defaultColSize = 'md'
      const ret = {
        colSize: this.colSize || $parent?.colSize || defaultColSize,
        labelCols: +(typeof this.labelCols !== 'undefined' ? this.labelCols : $parent?.labelCols),
        inputCols: +(typeof this.inputCols !== 'undefined' ? this.inputCols : $parent?.inputCols)
      }

      ret.labelClass = ret.labelCols ? `col-${ret.colSize}-${ret.labelCols}` : ''
      ret.inputClass = ret.inputCols ? `col-${ret.colSize}-${ret.inputCols}` : ''

      this.wrapperClasses = 'row mb-3'
      this.labelClasses = ret.labelClass
      this.inputClasses = ret.inputClass
      this.fullCol = ret.labelCols + ret.inputCols >= 12

      return ret
    },
    getParentForm () {
      let $parent = this.$parent

      for (let i = 0; i < 10; i++) {
        const props = $parent.$props

        if (
          props.labelCols !== undefined &&
          props.inputCols !== undefined
        ) {
          return $parent
        }
        $parent = $parent.$parent
        if (!$parent) {
          return null
        }
      }
    },
    checkErrorSlot () {
      this.hasErrorSlot = !!this.$slots.error?.()
    }
  }
}
</script>

<style scoped>
.form-group {
  position: relative;
}

.control-text,
.form-group :deep(.form-check) {
  padding-top: 7px;
}
</style>
