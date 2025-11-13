<template>
  <Row>
    <Cols :cols="7">
      <h3>
        {{ t('title') }}
        <a
          class="ml10"
          href="https://github.com/wenzhixin/redmine-chrome/issues"
          target="_blank"
          :title="t('feedback')"
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
              {{ t('language') }}
            </div>
          </template>
          <MultipleSelect
            v-model="language"
            :data="locales"
            class="dib w100"
            @change="updateLanguage"
          />
        </FormGroup>
      </Form>
    </Cols>
  </Row>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Utils from '@/utils'
import languages, { languageCodeToKey } from '@/i18n'

const { t } = useI18n()
const language = ref('zh_CN')

const locales = Object.keys(languages).map(code => ({
  value: code,
  text: t(languageCodeToKey[code])
}))

const updateLanguage = async () => {
  await Utils.setStorage('locale', language.value)
  location.reload()
}

onMounted(async () => {
  const savedLocale = await Utils.getStorage('locale')

  if (savedLocale) {
    language.value = savedLocale
  }
})
</script>
