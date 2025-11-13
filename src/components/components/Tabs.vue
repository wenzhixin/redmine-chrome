<template>
  <div>
    <ul
      v-show="!hideHeader"
      :class="{
        'nav-pills': pills,
        'nav-tabs': !(pills || list || bordered),
        'nav-stacked': list,
        'nav-bordered': bordered,
        'nav-outline': outline,
        'nav-center': center,
        'nav-fill': fill,
        'nav-list': list
      }"
      class="nav"
      role="tablist"
    >
      <template v-if="!list">
        <Tab
          v-for="(tab, index) in tabs"
          :key="index"
          :data-tab-id="index"
          :name="tab.name"
          :title="tab.title"
          :active="currentIndex === index"
          :disabled="tab.disabled"
          :icon="tab.icon"
          :image="tab.image"
          :data-hint="tab.hint"
          class="pr"
          data-hint-html="true"
          tab-title
          @click="onClick(index)"
        />
      </template>
      <slot v-if="list" />

      <div
        v-if="!center && !fill && !outline"
        class="nav-item tab-end"
      >
        <slot name="tab-end" />
      </div>
    </ul>
    <div
      v-if="!list"
      v-show="!hideContent"
      class="tab-content"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import Tab from './Tab.vue'

export default {
  name: 'Tabs',
  components: {
    Tab
  },
  props: {
    // `v-model`
    modelValue: {
      type: Number,
      default: undefined
    },
    // Renders the nav items with the appearance of list
    list: {
      type: Boolean,
      default: false
    },
    // Renders the nav items with the appearance of pill buttons
    pills: {
      type: Boolean,
      default: false
    },
    // Renders the nav items with bordered
    bordered: {
      type: Boolean,
      default: false
    },
    // Whether to hide the tab header
    hideHeader: {
      type: Boolean,
      default: false
    },
    // Whether to hide the tab content
    hideContent: {
      type: Boolean,
      default: false
    },
    // Whether fill full width
    fill: {
      type: Boolean,
      default: false
    },
    // Whether show in the center of the container
    center: {
      type: Boolean,
      default: false
    },
    // Whether show outline
    outline: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'click'],
  data () {
    return {
      tabs: [],
      currentIndex: undefined
    }
  },
  watch: {
    modelValue (index) {
      this.select(index)
    },
    tabs: {
      deep: true,
      handler () {
        if (this.tabs.length === 0) {
          return
        }

        let index

        // Only set initial tab if no selection has been made yet
        if (this.currentIndex === undefined) {
          // If modelValue is set, use that
          index = this.modelValue ?? 0

          // Fall back to finding active tab or default to 0
          if (index >= this.tabs.length || index < 0) {
            index = this.tabs.findIndex(it => it.active)

            if (index === -1) {
              index = 0
            }
          }
        } else {
          // Already have a selection, use that
          index = this.currentIndex
        }

        for (const tab of this.tabs) {
          tab.hideContent = this.hideContent
        }

        this.currentIndex = index
        this.tabs[index].toggleActive(true)
      }
    }
  },
  mounted () {
    setTimeout(() => {
      // delay for sub tab ready
      if (this.currentIndex === undefined) {
        this.select(this.modelValue ?? 0)
      }
    }, 50)
  },
  methods: {
    // @vuese
    // Select tab by index
    // @arg `index` The tab index, start from `0`
    select (index) {
      const tab = this.tabs[index]

      if (!tab || tab.disabled || this.currentIndex === index) {
        return false
      }
      this.tabs[this.currentIndex]?.toggleActive(false)

      this.currentIndex = index
      tab.toggleActive(true)
      return true
    },

    onClick (index) {
      if (this.select(index)) {
        this.$nextTick(() => {
          // `v-model`
          this.$emit('update:modelValue', this.currentIndex)
          // Fire when the tab is clicked
          // @arg `index` The index of tab
          this.$emit('click', index)
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.nav-pills {
  :deep(.nav-item .nav-link) {
    border-radius: 0;
  }
}

.tab-end {
  margin-left: auto;
}

.nav-bordered {
  :deep(li) {
    a {
      text-align: center;
      font-weight: normal;
      border-top: none;

      &.disabled {
        pointer-events: none;
        cursor: default;
      }

      &.active {
        font-weight: bold;
      }
    }
  }
}

.nav-center {
  justify-content: center;
}
</style>
