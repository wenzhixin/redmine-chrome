<template>
  <Row>
    <Cols :cols="7">
      <h3>
        {{ $t('title') }}
        <a
          class="ml10"
          href="https://github.com/wenzhixin/scutech-redmine/issues"
          target="_blank"
          :title="$t('feedback')"
        >
          <i class="f16 fa fa-reply" />
        </a>
      </h3>
    </Cols>

    <Cols :cols="5">
      <Form
        :label-cols="6"
        :input-cols="6"
      >
        <FormGroup>
          <template #label>
            <div class="tr">
              <i class="fa fa-flag" />
              {{ $t('language') }}
            </div>
          </template>
          <MultipleSelect
            v-model="language"
            class="dib w100"
            @change="updateLanguage"
          >
            <option value="zh-CN">
              {{ $t('chinese') }}
            </option>
            <option value="en-US">
              {{ $t('english') }}
            </option>
            <option value="ja-JP">
              {{ $t('japanese') }}
            </option>
            <option value="ru-RU">
              {{ $t('russian') }}
            </option>
            <option value="sp-SP">
              {{ $t('spanish') }}
            </option>
          </MultipleSelect>
        </FormGroup>
      </Form>
    </Cols>
  </Row>
</template>

<script setup>
import { ref } from 'vue'
import { $t } from '@/locales'
import Utils from '@/utils'

const language = ref(window.locale)

const updateLanguage = async () => {
  await Utils.setStorage('locale', language.value)
  location.reload()
}
</script>
