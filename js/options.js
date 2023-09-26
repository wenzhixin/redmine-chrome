/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

class Options {
  constructor () {
    this.init()
    this.initEvents()
  }

  init () {
    this.$language = $('#language')
    this.$save = $('#save')
    this.$urls = $('#urls')
    this.$advance = $('#advance')
    this.$addUrl = $('#addUrl')
    this.$projects = $('#projects')
    this.$roles = $('#roles')
    this.$status = $('#status')
    this.$trackers = $('#trackers')
    this.$number = $('#number')
    this.$interval = $('#interval')
    this.$notify = $('#notify')
    this.$notifyStatus = $('#notify_status')
  }

  initEvents () {
    this.$language.on('change', e => {
      settings('language', $(e.currentTarget).val())
      window.location.reload(true)
    }).val(settings('language'))

    this.$save.on('click', () => this.save())

    // urls
    const itemTpl = $('#itemTpl').html()

    this.$urls.html(settings('urls').map((url, i) =>
      util.sprintf(itemTpl, url, settings('keys')[i] || '')))

    this.$addUrl.on('click', () => {
      this.$urls.append(util.sprintf(itemTpl, '', ''))
    })
    $(document).on('click', '.remove-url', e => {
      $(e.currentTarget).parents('.input-inline').remove()
    })

    this.$urls.find('input[name="url"], input[name="key"]').on('blur', () => {
      this.initData()
    })

    if (settings('urls').length) {
      this.initData()
    } else {
      this.$addUrl.trigger('click')
    }

    this.initMultipleSelects(['roles'])

    // number, interval
    for (const name of ['number', 'interval']) {
      $(`#${name}`).multipleSelect({
        width: '100%',
        single: true,
        name
      }).multipleSelect('setSelects', [settings(name)])
    }
  }

  initData () {
    const url = this.$urls.find('input[name="url"]').val().trim().replace(/\/$/, '')
    const key = this.$urls.find('input[name="key"]').val().trim()

    if (!url || !key) {
      return this.$advance.hide()
    }
    this.$advance.show()

    this.getProjects(url, key)
    this.getStatus(url, key)
    this.getTrackers(url, key)
  }

  getProjects (url, key) {
    $.getJSON(`${url}/projects.json?limit=1000&key=${key}`).then(res => {
      this.$projects.html(res.projects.map(it =>
        `<option value="${it.id}">${it.name}</option>`))

      if (!settings('projects').length) {
        settings('projects', [0])
      }
      this.initMultipleSelects(['projects'])
    })
  }

  getStatus (url, key) {
    $.getJSON(`${url}/issue_statuses.json?key=${key}`).then(res => {
      this.$status.add(this.$notifyStatus).html(res.issue_statuses.map(it =>
        `<option value="${it.id}">${it.name}</option>`))

      if (!settings('status').length) {
        settings('status', [0])
      }
      if (!settings('notify_status').length) {
        settings('notify_status', [0])
      }
      this.initMultipleSelects(['status', 'notify_status'])

      this.$notify.prop('checked', settings('notify'))
      // notify_status
      const updateNotifyStatus = checked => {
        this.$notifyStatus.multipleSelect(checked ? 'enable' : 'disable')
      }

      this.$notify.off('click').on('click', () => {
        updateNotifyStatus(this.$notify.prop('checked'))
      })
      updateNotifyStatus(settings('notify'))
    })
  }

  getTrackers (url, key) {
    $.getJSON(`${url}/trackers.json?key=${key}`).then(res => {
      this.$trackers.html(res.trackers.map(it =>
        `<option value="${it.id}">${it.name}</option>`))

      if (!settings('trackers').length) {
        settings('trackers', [0])
      }
      this.initMultipleSelects(['trackers'])
    })
  }

  initMultipleSelects (ids) {
    for (const id of ids) {
      const $select = $(`#${id}`)

      $select.multipleSelect({
        width: '100%',
        selectAll: true,
        countSelected: false
      })

      if (settings(id)[0] === 0) {
        $select.multipleSelect('checkAll')
      } else {
        $select.multipleSelect('setSelects', settings(id))
      }
    }
  }

  getSelects ($select) {
    const selects = $select.multipleSelect('getSelects')

    if (selects.length === $select.multipleSelect('getData').length) {
      return [0]
    }
    return selects.map(i => +i)
  }

  save () {
    const urls = []
    const keys = []

    this.$urls.find('input[name="url"]').each((i, el) => {
      const url = $(el).val().trim()

      if (url) {
        urls.push(url.replace(/\/$/, ''))
      }
    })
    this.$urls.find('input[name="key"]').each((i, el) => {
      keys.push($(el).val().trim())
    })
    settings('urls', urls)
    settings('firstStart', false)
    settings('keys', keys)
    settings('projects', this.getSelects(this.$projects))
    settings('roles', this.$roles.multipleSelect('getSelects'))
    settings('status', this.getSelects(this.$status))
    settings('trackers', this.getSelects(this.$trackers))
    settings('number', +this.$number.multipleSelect('getSelects')[0])
    settings('interval', +this.$interval.multipleSelect('getSelects')[0])
    settings('notify', this.$notify.prop('checked'))
    settings('notify_status', this.getSelects(this.$notifyStatus))

    window.alert(locale.save_successful)
    chrome.extension.getBackgroundPage().background.reset()
  }
}

$(() => {
  util.initLocale()
  new Options()
})
