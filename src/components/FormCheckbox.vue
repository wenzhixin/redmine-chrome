<template>
  <div
    :class="inline ? 'form-check-inline' : 'checkbox'"
    class="form-check"
  >
    <input
      :id="id || vid"
      :name="name"
      :value="bondValue"
      :checked="checked"
      :required="required"
      :disabled="disabled"
      type="checkbox"
      class="form-check-input"
      @change="onChange"
    >
    <label
      class="form-check-label"
      :for="id || vid"
    >
      <slot>{{ label }}</slot>
      <i
        v-if="help"
        :data-hint="help"
        :class="{ 'has-label': !!label }"
        data-hint-html="true"
        data-hint-align="left"
        class="far fa-circle-question"
      />
    </label>
  </div>
</template>

<script>
export default {
  name: 'FormCheckbox',
  props: {
    // `v-model`
    modelValue: {
      type: [Boolean, String, Number, Object],
      default: null
    },
    // value attribute
    value: {
      type: [Boolean, String, Number, Object],
      default: undefined
    },
    // The name of checkbox
    name: {
      type: String,
      default: undefined
    },
    // The id of checkbox
    id: {
      type: String,
      default: undefined
    },
    // The label of checkbox
    label: {
      type: String,
      default: undefined
    },
    // Whether is required of checkbox
    required: {
      type: Boolean,
      default: false
    },
    // Whether is disabled of checkbox
    disabled: {
      type: Boolean,
      default: false
    },
    // Whether is inline of checkbox
    inline: {
      type: Boolean,
      default: false
    },
    // To show the input help icon
    help: {
      type: String,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'change'],
  data () {
    return {
      vid: this.$.uid || Math.random().toString().substr(2),
      checked: false
    }
  },
  computed: {
    bondValue () {
      return [null, undefined].includes(this.value) ? this.modelValue : this.value
    },
    isBoolean () {
      return typeof this.bondValue === 'boolean'
    }
  },
  watch: {
    bondValue (val) {
      this.checked = this.isBoolean && val
    }
  },
  mounted () {
    this.checked = this.isBoolean && this.bondValue
  },
  methods: {
    onChange (e) {
      if (this.isBoolean) {
        this.checked = e.target.checked
        // `v-model`
        this.$emit('update:modelValue', this.checked)
        // Fire when the checkbox is changed
        this.$emit('change', e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.fa-circle-question.has-label {
  margin-left: 5px;
}
</style>
