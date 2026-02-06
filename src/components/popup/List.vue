<template>
  <div class="issues-list">
    <Toast
      ref="toast"
      :message="t('copy_success')"
    />
    <div
      v-for="(issue, index) in sortedIssues"
      :key="issue.id + issue.updated_on"
      class="list-group-item"
      :class="{ 'fw-bold': isUnread(issue) }"
      @click="markIssueRead(issue)"
    >
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <span :class="`badge bg-${issue.priority.name.toLowerCase()}`">
            {{ issue.priority.name }}
          </span>
          <span class="ms-2 small">{{ issue.status.name }}</span>
        </div>
        <div class="text-end">
          <div class="small">
            {{ issue.project.name }}
            ({{ formatTime(issue.updated_on) }})
          </div>
        </div>
      </div>
      <div class="mt-2 d-flex align-items-center gap-2">
        <button
          class="btn btn-sm btn-link p-0 copy-btn"
          :title="t('copy_issue_id')"
          @click.stop="handleCopyIssueId(issue.id, $event)"
        >
          <i class="fas fa-copy" />
        </button>
        <button
          class="btn btn-sm btn-link p-0 open-btn"
          title="Open in new tab"
          @click.stop="openIssueInNewTab(issue)"
        >
          <i class="fa-solid fa-arrow-up-right-from-square" />
        </button>
        <a
          href="#"
          target="_blank"
          class="issue-link text-decoration-none"
          @click.prevent.stop="selectIssue(issue, index)"
        >
          <span
            v-if="isUnread(issue)"
            class="unread-indicator"
          />
          {{ issue.tracker.name }} #{{ issue.id }}: {{ issue.subject }}
        </a>
      </div>
    </div>

    <div
      v-if="currentData?.error"
      class="text-center p-4"
    >
      <a
        href="options.html"
        target="_blank"
        class="btn btn-danger"
      >
        {{ t('settings_error') }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import Utils from '@/utils'
import dayjs from 'dayjs'
import { computed, nextTick, onMounted, ref } from 'vue'

const { t } = useI18n()

const toast = ref()
const options = ref({})

const props = defineProps({
  sortedIssues: {
    type: Array,
    required: true
  },
  currentData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['select-issue', 'mark-issue-read'])

// 创建响应式的 isUnread 函数
const isUnread = computed(() => issue => props.currentData.unreadList.includes(Utils.getUUID(issue)))

const formatTime = dateString => dayjs(dateString).fromNow()

const handleCopyIssueId = async (issueId, event) => {
  await Utils.copyIssueId(issueId)
  toast.value.show(event)
}

const markIssueRead = issue => {
  if (isUnread.value(issue)) {
    emit('mark-issue-read', Utils.getUUID(issue))
  }
}

const selectIssue = (issue, index) => {
  markIssueRead(issue)
  nextTick(() => {
    emit('select-issue', issue, index)
  })
}

const openIssueInNewTab = issue => {
  const baseUrl = options.value.url?.endsWith('/') ?
    options.value.url.slice(0, -1) :
    options.value.url

  window.open(`${baseUrl}/issues/${issue.id}`, '_blank')
}

onMounted(async () => {
  options.value = await Utils.getStorage('options') || {}
})
</script>

<style lang="scss" scoped>
.list-group-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--bs-border-color);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
}

.issue-link {
  display: inline-flex;
  align-items: center;

  .unread-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--bs-primary);
    margin-right: 8px;
    flex-shrink: 0;
    margin-top: 1px; /* 微调指示器垂直位置 */
  }
}

.copy-btn,
.open-btn {
  width: 18px;
  height: 18px;
  font-size: 12px;
  color: #6c757d; /* 灰色文本 */

  &:hover {
    color: #495057; /* 鼠标悬停加深颜色 */
  }

  i {
    font-size: 12px;
  }
}

.gap-2 {
  gap: 6px !important;
}

.badge {
  &.bg-immediate {
    background: BlueViolet;
  }

  &.bg-urgent {
    background: #d9534f;
  }

  &.bg-high {
    background: #d1761f;
  }

  &.bg-normal {
    background-color: #f0ad4e;
  }

  &.bg-low {
    background: #aed2e8;
  }
}
</style>
