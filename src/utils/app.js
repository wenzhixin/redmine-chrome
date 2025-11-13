import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import Utils from '@/utils'
import Components from '@/components/components'
import messages from '@/i18n'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import 'dayjs/locale/ja'
import 'dayjs/locale/ru'
import 'dayjs/locale/es'

// Extend dayjs to support relative time
dayjs.extend(relativeTime)

/**
 * Create and initialize Vue app
 * @param {Object} AppComponent - Root component
 * @param {string} mountSelector - Mount selector
 * @param {string} defaultLocale - Default locale
 * @param {string} appName - App name (for logging)
 * @returns {Promise<Object>} Returns the created app instance
 */
export const createAppWithI18n = async (AppComponent, mountSelector = '#app') => {
  const storedLocale = await Utils.getStorage('locale')

  window.locale = storedLocale || 'zh_CN'

  dayjs.locale({
    zh_CN: 'zh-cn',
    sp: 'es'
  }[window.locale] || window.locale)

  Object.assign(window.jQuery.fn.multipleSelect.defaults, {
    ...window.jQuery.fn.multipleSelect.locales[{
      zh_CN: 'zh',
      sp: 'es'
    }[window.locale] || window.locale]
  })

  const app = createApp(AppComponent)
  const i18n = createI18n({
    locale: window.locale,
    fallbackLocale: 'en',
    messages
  })

  app.use(i18n)

  // Register all components
  for (const [key, value] of Object.entries(Components)) {
    app.component(key, value)
  }

  app.mount(mountSelector)

  return app
}
