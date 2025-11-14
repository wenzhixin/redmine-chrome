<template>
  <div class="popup-container">
    <div
      v-if="!options.url"
      class="p20 tc"
    >
      <a
        href="options.html"
        target="_blank"
      >
        {{ t('add_redmine_first') }}
      </a>
    </div>

    <Issues
      v-else-if="!showDetail"
      @select-issue="showIssue"
    />

    <Detail
      v-else
      :key="options.key"
      :selected-issue="selectedIssue"
      :options="options"
      @close-detail="closeDetail"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Utils from '@/utils'
import Issues from '@/components/popup/Issues.vue'
import Detail from '@/components/popup/Detail.vue'

const { t } = useI18n()

const showDetail = ref(false)
const selectedIssue = ref({})
const options = ref({})

const showIssue = issue => {
  // selectedIssue.value = issue
  // showDetail.value = true

  // 目前直接跳转到 issue url 中
  setTimeout(() => {
    window.open(`${options.value.url}/issues/${issue.id}`, '_blank')
  }, 100)
}

const closeDetail = () => {
  selectedIssue.value = {}
  showDetail.value = false
}

onMounted(async () => {
  options.value = await Utils.getStorage('options') || {}
})
</script>

<style scoped>
.popup-container {
  width: 600px;
}
</style>
