/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

window.settings = (key, value) => {
  const defaults = {
    language: 'en-US',
    urls: [],
    keys: [],
    projects: [],
    roles: ['assigned_to_id'],
    status: [],
    trackers: [],
    number: 25,
    interval: 5,
    notify: true,
    notify_status: [],
    new: false,
    data: {},
    editors: {}, // save the editor content
    unread: 0,
    url_index: 0,
    role_index: 0,
    order: 'default' // default, updated_on, priority.id, created_on
  }

  if (typeof value === 'undefined') {
    return typeof store.get(key) !== 'undefined' ? store.get(key) : defaults[key]
  }

  store.set(key, value)
  return this
}

window.util = {
  sprintf (str) {
    const args = arguments
    let flag = true
    let i = 1

    str = str.replace(/%s/g, () => {
      const arg = args[i++]

      if (typeof arg === 'undefined') {
        flag = false
        return ''
      }
      return arg
    })
    if (flag) {
      return str
    }
    return ''
  },

  initLocale () {
    window.locale = window.locales[settings('language')]
    util.setLocale($('html'))
  },

  setLocale ($el) {
    $el.find('[i18n-properties]').each((i, el) => {
      const properties = $(el).attr('i18n-properties').split(':')

      if (properties.length === 2) {
        $(el).attr(properties[0], locale[properties[1]])
      }
    })
    $el.find('[i18n-values]').each((i, el) => {
      $(el).text(locale[$(el).attr('i18n-values')])
    })
  },

  filterIssues (keys, issues, data) {
    return issues.filter(issue => {
      for (const k in data) {
        if ($.inArray(k, keys) === -1) continue
        for (let i = 0; i < data[k].issues.length; i++) {
          if (data[k].issues[i].id === issue.id) {
            return false
          }
        }
      }
      return true
    })
  },

  getIuid (issue) {
    return issue.id + new Date(issue.updated_on).getTime()
  },

  getPriorityLabel (priority) {
    return priority.toLowerCase()
  },

  copyText (text) {
    const $copyFrom = $('<textarea></textarea>')

    $('body').append($copyFrom)
    $copyFrom.val(text).select()
    document.execCommand('copy')
    $copyFrom.remove()
  },

  convertTextile (text) {
    const $copyFrom = $('<textarea></textarea>')

    $('body').append($copyFrom)
    $copyFrom.val(text)
    text = textile.convert($copyFrom.val())
    $copyFrom.remove()
    return text
  },

  getValueByString (o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
    s = s.replace(/^\./, '') // strip a leading dot
    const a = s.split('.')

    while (a.length) {
      const n = a.shift()

      if (n in o) {
        o = o[n]
      } else {
        return ''
      }
    }
    return o
  },

  getUrl (base, url) {
    if (url && url.slice(0, 1) === '/') {
      const a = document.createElement('a')

      a.href = base
      return `${a.protocol}//${a.host}${url}`
    }
    return url
  },

  sortIssues (issues, unreadList) {
    let order = settings('order')
    const sorter = (a, b) => {
      const aa = util.getValueByString(a, order)
      const bb = util.getValueByString(b, order)

      if (aa < bb) {
        return 1
      }
      if (aa > bb) {
        return -1
      }
      return 0
    }

    if (order === 'default') {
      const issues1 = []
      let issues2 = []

      $.each(issues, (i, issue) => {
        if ($.inArray(util.getIuid(issue), unreadList) !== -1) {
          issues1.push(issue)
        } else {
          issues2.push(issue)
        }
      })
      order = 'priority.id'
      issues2 = issues2.sort(sorter)
      return issues1.concat(issues2)
    }

    return issues.sort(sorter)
  }
}
