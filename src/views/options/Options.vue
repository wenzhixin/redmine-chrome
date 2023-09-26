<template>
  <Form v-if="step === 0">
    <FormGroup :label="$t('redmine_list')">
      <FormInput
        v-model="options.url"
        placeholder="https://demo.redmine.org"
      />
    </FormGroup>
    <FormGroup :label="$t('redmine_api_key')">
      <FormInput
        v-model="options.key"
      />
    </FormGroup>
    <FormGroup>
      <Button
        type="primary"
        icon="fa fa-arrow-right"
        :disabled="!options.url || !options.key"
        :loading="loading"
        @click="getData"
      >
        {{ $t('step_next') }}
      </Button>
    </FormGroup>
  </Form>

  <Form v-if="step === 1">
    <FormGroup :label="$t('redmine_list')">
      <FormInput
        v-model="options.url"
        disabled
      />
    </FormGroup>

    <FormGroup
      v-for="select in selects"
      :key="select.name"
      :label="select.label"
    >
      <template #label>
        <FormCheckbox
          v-if="select.name === 'notify_status'"
          v-model="options.notify"
          :label="$t('desktop_notify')"
        />
        <span v-else>{{ select.label }}</span>
      </template>
      <MultipleSelect
        v-model="options[select.name]"
        :data="list[select.name]"
        :multiple="!select.single"
      />
    </FormGroup>

    <FormGroup>
      <Button
        class="mr10"
        icon="fa fa-arrow-left"
        @click="step--"
      >
        {{ $t('step_previous') }}
      </Button>
      <Button
        type="primary"
        icon="fa fa-save"
        :disabled="!saveEnable"
        @click="save"
      >
        {{ $t('save_your_changes') }}
      </button>
    </FormGroup>
  </Form>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { $t } from '@/locales'
import Utils from '@/utils'

const step = ref(0)
const loading = ref(false)
const options = ref({
  url: window.options.url || '',
  key: window.options.key || '',
  projects: [],
  issues: window.options.issues || ['assigned_to_id', 'author_id', 'watcher_id'],
  status: [],
  number: window.options.number || 50,
  trackers: [],
  interval: window.options.interval || 10,
  notify: window.options.notify ?? true,
  notify_status: []
})
const list = ref({
  projects: [],
  issues: [
    {
      value: 'assigned_to_id',
      text: $t('roles_assigned_to_id')
    },
    {
      value: 'author_id',
      text: $t('roles_author_id')
    },
    {
      value: 'watcher_id',
      text: $t('roles_watcher_id')
    }
  ],
  status: [],
  number: [25, 50, 100],
  trackers: [],
  interval: [
    {
      value: 1,
      text: $t('minutes_1')
    },
    {
      value: 5,
      text: $t('minutes_5')
    },
    {
      value: 10,
      text: $t('minutes_10')
    },
    {
      value: 20,
      text: $t('minutes_20')
    },
    {
      value: 30,
      text: $t('minutes_30')
    },
    {
      value: 60,
      text: $t('hours_1')
    }
  ],
  notify_status: []
})
const selects = [
  {
    label: $t('projects_list'),
    name: 'projects'
  },
  {
    label: $t('issues_list'),
    name: 'issues'
  },
  {
    label: $t('issue_status'),
    name: 'status'
  },
  {
    label: $t('issue_number'),
    name: 'number',
    single: true
  },
  {
    label: $t('trackers_list'),
    name: 'trackers'
  },
  {
    label: $t('update_interval'),
    name: 'interval',
    single: true
  },
  {
    name: 'notify_status'
  }
]

const saveEnable = computed(() => Object.values(options.value).every(it => {
  if (Array.isArray(it)) {
    return it.length > 0
  }
  return true
}))

const toList = items => items.map(it => ({ value: it.id, text: it.name }))
const getData = async () => {
  window.options.url = options.value.url
  window.options.key = options.value.key
  loading.value = true

  try {
    list.value.projects = toList(await Utils.getAPI('projects'))
    options.value.projects = window.options.projects || list.value.projects.map(it => it.value)

    list.value.status = toList(await Utils.getAPI('issue_statuses'))
    options.value.status = window.options.status || [list.value.status[0].value]

    list.value.trackers = toList(await Utils.getAPI('trackers'))
    options.value.trackers = window.options.trackers || list.value.trackers.map(it => it.value)

    list.value.notify_status = list.value.status
    options.value.notify_status = window.options.notify_status || [list.value.notify_status[0].value]

    step.value += 1
    loading.value = false
  } catch (e) {
    console.error(e)
    loading.value = false
    window.alert($t('settings_error'))
  }
}

const save = () => {
  Utils.setStorage('options', options.value)
  window.alert($t('save_successful'))
}

onMounted(async () => {
  if (options.value.url && options.value.key) {
    await getData()
  }
})
</script>
