import 'multiple-select/dist/multiple-select.min.css'
import 'multiple-select/dist/themes/bootstrap.min.css'

import 'multiple-select/src/multiple-select'

import 'multiple-select/src/locale/multiple-select-en-US'
import 'multiple-select/src/locale/multiple-select-ja-JP'
import 'multiple-select/src/locale/multiple-select-ru-RU'
import 'multiple-select/src/locale/multiple-select-zh-CN'

window.jQuery.extend(window.jQuery.fn.multipleSelect.defaults, {
  classPrefix: 'form-control',
  classInput: 'form-check-input',
  filterByDataLength: 10
})
