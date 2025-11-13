<template>
  <Tabs
    v-if="roles.length > 1"
    v-model="currentIndex"
    hide-content
    class="tabs-header"
    @click="handleRoleChange"
  >
    <Tab
      v-for="role in roles"
      :key="role"
      :title="getTabTitle(role)"
    />
  </Tabs>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Tabs from '@/components/components/Tabs.vue'
import Tab from '@/components/components/Tab.vue'

const { t } = useI18n()

const props = defineProps({
  roles: {
    type: Array,
    required: true
  },
  roleIndex: {
    type: Number,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['role-change'])

const currentIndex = ref(props.roleIndex)

const getRoleIssueCount = role => props.data[role]?.issues?.length || 0

const getRoleUnreadCount = role => props.data[role]?.unreadList?.length || 0

const getTabTitle = role => {
  const count = getRoleUnreadCount(role)

  return `${t(`roles_${role}`)}(${getRoleIssueCount(role)})${
    count > 0 ?
      `<span class="badge rounded-pill bg-info ms-1">
      ${count}
    </span>` : ''}`
}

const handleRoleChange = index => {
  nextTick(() => {
    emit('role-change', index)
  })
}

watch(() => props.roleIndex, newIndex => {
  currentIndex.value = newIndex
})
</script>

<style lang="scss" scoped>
.tabs-header {
  :deep(.nav-link) {
    >span {
      margin-right: 10px;
    }
  }

  :deep(.badge) {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100;
  }
}
</style>
