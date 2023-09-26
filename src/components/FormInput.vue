<template>
  <input
    v-model="currentValue"
    :name="name"
    :type="type"
    :required="required"
    :disabled="disabled"
    :placeholder="placeholder"
    :class="classes"
    @update:model-value="onUpdate"
    @change="onChange"
    @focus="$emit('focus')"
    @keyup="$emit('keyup', $event)"
    @keydown="$emit('keydown', $event)"
    @click="$emit('click')"
    @blur="$emit('blur', $event)"
  >
</template>

<script>
export default {
  name: 'FormInput',
  props: {
    // `v-model`
    modelValue: {
      type: [String, Number],
      default: null
    },
    // value attribute
    value: {
      type: [String, Number],
      default: null
    },
    // The name of form input
    name: {
      type: String,
      default: undefined
    },
    // The type of form input, default value is `'text'`
    type: {
      type: String,
      default: 'text'
    },
    // Whether is required of from input
    required: {
      type: Boolean,
      default: false
    },
    // Whether is disabled of from input
    disabled: {
      type: Boolean,
      default: false
    },
    // The placeholder of form input
    placeholder: {
      type: String,
      default: undefined
    },
    // The size of form input, can be `'sm'` or `'lg'`
    size: {
      type: String,
      default: undefined
    },
    // Border color
    border: {
      type: String,
      default: ''
    }
  },
  emits: ['focus', 'keyup', 'keydown', 'click', 'blur', 'update:modelValue', 'change'],
  data () {
    return {
      currentValue: this.value || this.modelValue
    }
  },
  computed: {
    classes () {
      return [
        'form-control',
        'ellipsis-text-overflow',
        this.size ? `form-control-${this.size}` : '',
        this.border ? `input-border-${this.border}` : ''
      ].join(' ')
    }
  },
  watch: {
    modelValue (val) {
      this.currentValue = val
    },
    value (val) {
      this.currentValue = val
    }
  },
  methods: {
    focus () {
      this.$el.focus()
    },
    onUpdate () {
      // `v-model`
      this.$emit('update:modelValue', this.currentValue)
    },
    onChange (event) {
      // Fire when the input is changed
      this.$emit('change', event)
    }
  }
}
</script>
