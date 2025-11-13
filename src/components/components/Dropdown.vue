<template>
  <div
    ref="root"
    :class="{
      w: fill,
      dropup,
      dropdown: !dropup && !inButtonGroup,
      'btn-group': inButtonGroup
    }"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
  >
    <button
      v-if="!isLink"
      :class="classes"
      :disabled="disabled ? true : undefined"
      :data-hint="hint"
      data-hint-html="true"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <template v-if="!loading">
        <i
          v-if="icon"
          :class="icon"
          class="mr5"
        />
        <img
          v-if="avatar"
          class="dropdown-avatar"
          :src="avatar"
        >
        {{ text }}
      </template>
      <template v-else>
        <i class="fa fa-spinner fa-spin" />
        {{ loadingText || loadingTextI18n }}
      </template>
    </button>
    <a
      v-else
      class="{ 'dropdown-toggle': toggleIcon }"
      :disabled="disabled ? true : undefined"
      :data-hint="hint"
      data-hint-html="true"
      href="#"
      :tabindex="disabled ? -1 : 0"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <i
        v-if="icon"
        :class="icon"
        class="mr5"
      />
      {{ text }}
    </a>

    <component
      :is="element"
      class="dropdown-menu"
    >
      <slot v-if="showItems" />
    </component>
  </div>
</template>

<script setup>
import { computed, onMounted, onUpdated, ref, useTemplateRef } from 'vue'

const props = defineProps({
  // The text of dropdown
  text: {
    type: String,
    default: ''
  },
  // The type of dropdown, can be `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, or `'transparent'`
  type: {
    type: String,
    default: undefined
  },
  // The size of dropdown, can be `'sm'` or `'lg'`
  size: {
    type: String,
    default: undefined
  },
  // Whether to disable the dropdown
  disabled: {
    type: Boolean,
    default: false
  },
  // Whether is a link of the dropdown
  isLink: {
    type: Boolean,
    default: false
  },
  // The hint tooltip
  hint: {
    type: String,
    default: undefined
  },
  // Hover to open the dropdown instead of click
  hoverOpen: {
    type: Boolean,
    default: false
  },
  // Whether is loading of the button
  loading: {
    type: Boolean,
    default: false
  },
  // The loading text when loading is `true`
  loadingText: {
    type: String,
    default: ''
  },
  // The icon for the button
  icon: {
    type: String,
    default: undefined
  },
  // The image URL for the avatar
  avatar: {
    type: String,
    default: ''
  },
  toggleIcon: {
    type: Boolean,
    default: true
  },
  // Whether fill full width
  fill: {
    type: Boolean,
    default: false
  },
  // Whether the button icon is displayed as up
  dropup: {
    type: Boolean,
    default: false
  },
  // whether render as table
  table: {
    type: Boolean,
    default: false
  },
  // Lazy load the dropdown menu for better performance
  lazy: {
    type: Boolean,
    default: false
  }
})
const btnSize = ref('')
const inButtonGroup = ref(false)
const container = useTemplateRef('root')
const initializedItems = ref(false)
const classes = computed(() => {
  let type = props.type || 'default'

  if (type === 'default') {
    type = 'secondary'
  }

  return [
    'btn',
    `btn-${type}`,
    props.size ? `btn-${props.size}` : '',
    btnSize.value ? `btn-${btnSize.value}` : '',
    props.toggleIcon ? 'dropdown-toggle' : '',
    props.avatar ? 'btn-avatar' : '',
    props.fill ? 'btn-fill' : ''
  ].filter(it => it).join(' ')
})
const loadingTextI18n = computed(() => window.AdminApp.i18n.loadingText)
const element = computed(() => props.table ? 'table' : 'ul')
const showItems = computed(() => !props.lazy || initializedItems.value)
const refreshSize = () => {
  const parentClass = container.value.parentElement.classList

  inButtonGroup.value = parentClass.contains('btn-group')
  btnSize.value = ''
  if (!props.size && inButtonGroup.value) {
    if (parentClass.contains('btn-group-lg')) {
      btnSize.value = 'lg'
    } else if (parentClass.contains('btn-group-sm')) {
      btnSize.value = 'sm'
    }
  }
}
const getDropdown = () => {
  const el = container.value.querySelector('[data-bs-toggle="dropdown"]')

  if (!el) {
    console.error('Element [data-bs-toggle="dropdown"] not exits')
    return
  }
  return window.bootstrap.Dropdown.getInstance(el) || new window.bootstrap.Dropdown(el)
}
const isShow = () => container.value.querySelector('[data-bs-toggle="dropdown"]').classList.contains('show')
const open = () => {
  initializedItems.value = true
  if (isShow()) {
    return
  }
  // close others
  document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(item => {
    window.bootstrap.Dropdown.getInstance(item)?.hide()
  })
  getDropdown().show()
}
const close = () => {
  getDropdown().hide()
}
const toggle = () => {
  getDropdown().toggle()
}
let hoverTimer = 0
const handleMouseenter = () => {
  if (!props.hoverOpen) {
    return
  }
  clearTimeout(hoverTimer)
  open()
}
const handleMouseleave = () => {
  if (!props.hoverOpen) {
    return
  }
  hoverTimer = setTimeout(() => {
    close()
  }, 100)
}

onUpdated(() => {
  refreshSize()
})
onMounted(() => {
  refreshSize()
  container.value.addEventListener('show.bs.dropdown', () => {
    initializedItems.value = true
  })
})
defineExpose({
  open,
  close,
  toggle
})
</script>

<style lang="scss" scoped>
.dropdown, .dropup {
  display: inline-block;

  .dropdown-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }

  .btn-avatar {
    border: 0;
  }
}

.dropdown-menu {
  min-width: 100%;
}

.btn-fill {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
