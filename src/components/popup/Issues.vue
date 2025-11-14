<template>
  <div class="p15">
    <Header
      :roles="roles"
      :role-index="roleIndex"
      :data="data"
      @role-change="handleRoleChange"
    />

    <Sort
      :order="order"
      :unread-count="unreadCount"
      @order-change="setOrder"
      @mark-all-read="markAllRead"
    />

    <List
      :sorted-issues="sortedIssues"
      :current-data="currentData"
      @select-issue="showIssue"
      @mark-issue-read="markIssueRead"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Utils from '@/utils'
import Header from '@/components/popup/Header.vue'
import Sort from '@/components/popup/Sort.vue'
import List from '@/components/popup/List.vue'

const emit = defineEmits(['select-issue'])

const roles = ref([])
const roleIndex = ref(0)
const order = ref('default')
const data = ref({})

const currentRole = computed(() => roles.value[roleIndex.value])
const currentData = computed(() => data.value[currentRole.value] ||
  { issues: [], unreadList: [], readList: [] })
const isUnread = issue => {
  if (!currentData.value?.unreadList) return false
  const iuid = `${issue.id}${new Date(issue.updated_on).getTime()}`

  return currentData.value.unreadList.includes(iuid)
}
const sortedIssues = computed(() => {
  if (!currentData.value?.issues) {
    return []
  }

  const getValueByString = (obj, path) => {
    if (!obj || !path) return ''
    return path.split('.').reduce((o, p) => (o || {})[p], obj)
  }
  const issues = [...currentData.value.issues]

  if (order.value === 'default') {
    const unread = []
    const read = []

    issues.forEach(issue => {
      if (isUnread(issue)) {
        unread.push(issue)
      } else {
        read.push(issue)
      }
    })

    // Sort read issues by priority
    read.sort((a, b) => (b.priority?.id || 0) - (a.priority?.id || 0))
    return [...unread, ...read]
  }
  // Sort by specified field
  issues.sort((a, b) => {
    const aVal = getValueByString(a, order.value)
    const bVal = getValueByString(b, order.value)

    return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
  })


  return issues
})
const unreadCount = computed(() => currentData.value?.unreadList?.length || 0)

const saveSettings = async () => {
  const settings = {
    role_index: roleIndex.value,
    order: order.value
  }

  await Utils.setStorage('popup_settings', settings)
}

const handleRoleChange = async index => {
  roleIndex.value = index
  await saveSettings()
}

const setOrder = async newOrder => {
  order.value = newOrder
  await saveSettings()
}

// Calculate total unread count across all roles
const calculateTotalUnread = () => {
  let total = 0

  for (const role of roles.value) {
    if (data.value[role]?.unreadList) {
      total += data.value[role].unreadList.length
    }
  }
  return total
}

const saveData = async () => {
  await Utils.setStorage('data', data.value)
  // Update badge text with total unread count
  const totalUnread = calculateTotalUnread()

  Utils.setBadgeText(totalUnread > 0 ? `${totalUnread}` : '')
}

const markAllRead = async () => {
  const curData = data.value[currentRole.value]

  if (curData) {
    curData.unreadList = []
    curData.readList = []
    curData.lastRead = Date.now()
    await saveSettings()
    await saveData()
  }
}

const markIssueRead = async uuid => {
  const curData = data.value[currentRole.value]

  if (curData && curData.unreadList) {
    const index = curData.unreadList.indexOf(uuid)

    if (index !== -1) {
      curData.unreadList.splice(index, 1)
      await saveData()
    }
  }
}

const showIssue = async (issue, index) => {
  emit('select-issue', issue, index)
}

const loadSettings = async () => {
  const popupSettings = await Utils.getStorage('popup_settings') || {}
  const options = await Utils.getStorage('options') || {}

  roles.value = options.issues || ['assigned_to_id']
  roleIndex.value = popupSettings.role_index || 0
  order.value = popupSettings.order || 'default'
  data.value = await Utils.getStorage('data') || {}
}

const fixBadgeError = async () => {
  const badgeText = await Utils.getBadgeText()

  // Fix background request error display x
  if (
    badgeText === 'x' &&
    Object.values(data.value).some(it => it.issues.length > 0)
  ) {
    // Clear error badge and update with actual count
    const totalUnread = calculateTotalUnread()
    Utils.setBadgeText(totalUnread > 0 ? `${totalUnread}` : '')
  }
}

onMounted(async () => {
  await loadSettings()
  await fixBadgeError()

  // Listen for storage changes
  chrome.storage?.onChanged?.addListener(changes => {
    if (changes.data) {
      const newData = JSON.parse(changes.data.newValue || '{}')

      data.value = newData
    } else if (changes.options) {
      const newSettings = JSON.parse(changes.options.newValue || '{}')

      if (newSettings.data) {
        data.value = newSettings.data
      }
    }
  })
})
</script>
