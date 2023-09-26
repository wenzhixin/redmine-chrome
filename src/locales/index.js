import './en-US'
import './ja-JP'
import './ru-RU'
import './sp-SP'
import './zh-CN'

const $t = key => window.locales[window.locale][key]

export {
  $t
}
