<template>
  <div class="issues-list">
    <div
      v-for="(issue, index) in sortedIssues"
      :key="issue.id + issue.updated_on"
      class="list-group-item"
      :class="{ 'fw-bold': isUnread(issue) }"
    >
      <div class="d-flex justify-content-between align-items-start">
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
      <div class="mt-2 d-flex align-items-start">
        <button
          class="btn btn-sm btn-link p-0 me-2"
          :title="t('copy_issue_id')"
          @click.stop="Utils.copyIssueId(issue.id)"
        >
          <i class="fas fa-copy" />
        </button>
        <a
          href="#"
          target="_blank"
          class="text-decoration-none"
          @click.prevent="selectIssue(issue, index)"
        >
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
import { computed, nextTick } from 'vue'

const { t } = useI18n()

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

const selectIssue = (issue, index) => {
  if (isUnread.value(issue)) {
    emit('mark-issue-read', Utils.getUUID(issue))
  }
  nextTick(() => {
    emit('select-issue', issue, index)
  })
}
</script>

<style lang="scss" scoped>
.list-group-item {
  padding: 5px 0;
  border-bottom: 1px solid var(--bs-border-color);

  &:last-child {
    border-bottom: none;
  }
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
