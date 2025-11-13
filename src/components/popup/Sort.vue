<template>
  <div class="sort-container d-flex align-items-center">
    <button
      v-if="unreadCount > 0"
      class="mark-all btn btn-outline-primary btn-sm me-2"
      @click="markAllRead"
    >
      <i class="fas fa-check" /> {{ t('mark_all_read') }}
    </button>

    <div class="ms-auto">
      <Dropdown
        is-link
        icon="fas fa-sort-amount-down"
        :toggle-icon="false"
        class="order-by"
      >
        <DropdownItem
          :active="order === 'default'"
          @click="setOrder('default')"
        >
          <i class="fas fa-heart" /> {{ t('order_by_default') }}
        </DropdownItem>
        <DropdownItem
          :active="order === 'priority.id'"
          @click="setOrder('priority.id')"
        >
          <i class="fas fa-arrow-down" /> {{ t('order_by_priority') }}
        </DropdownItem>
        <DropdownItem
          :active="order === 'updated_on'"
          @click="setOrder('updated_on')"
        >
          <i class="fas fa-arrow-down" /> {{ t('order_by_updated') }}
        </DropdownItem>
        <DropdownItem
          :active="order === 'created_on'"
          @click="setOrder('created_on')"
        >
          <i class="fas fa-arrow-down" /> {{ t('order_by_created') }}
        </DropdownItem>
      </Dropdown>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import Dropdown from '@/components/components/Dropdown.vue'
import DropdownItem from '@/components/components/DropdownItem.vue'

const { t } = useI18n()

defineProps({
  order: {
    type: String,
    default: 'default'
  },
  unreadCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['order-change', 'mark-all-read'])

const setOrder = newOrder => {
  emit('order-change', newOrder)
}

const markAllRead = () => {
  emit('mark-all-read')
}
</script>

<style scoped>
.mark-all {
  width: 100%;
  height: 24px;
  line-height: 22px;
  padding: 0;
}
</style>
