/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

$(() => {
  const $language = $('#language')
  const $save = $('#save')
  const $urls = $('#urls')
  const $advance = $('#advance')
  const $addUrl = $('#addUrl')
  const $roles = $('#roles')
  const $status = $('#status')
  const $trackers = $('#trackers')
  const $number = $('#number')
  const $interval = $('#interval')
  const $notify = $('#notify')
  const $notifyStatus = $('#notify_status')

  const init = () => {
    $('[data-toggle="tooltip"]').tooltip({
      placement: 'bottom'
    })

    // language
    $language.change(e => {
      settings('language', $(e.currentTarget).val())
      window.location.reload(true)
    }).val(settings('language'))

    $save.click(save)

    // urls
    const itemTpl = $('#itemTpl').html()
    const urlsHtml = []

    $.each(settings('urls'), (i, url) => {
      urlsHtml.push(util.sprintf(itemTpl, url, settings('keys')[i] || ''))
    })
    $urls.html(urlsHtml.join(''))
    $addUrl.click(() => {
      $urls.append(util.sprintf(itemTpl, '', ''))
    })
    $(document).on('click', '.remove-url', e => {
      $(e.currentTarget).parents('.input-inline').remove()
    })

    if (settings('urls').length) {
      $advance.show()

      const url = $urls.find('input[name="url"]').val().trim()
      const key = $urls.find('input[name="key"]').val().trim()
      getStatus(url, key)
      getTrackers(url, key)
    } else {
      $addUrl.trigger('click')
    }

    initMultipleSelects(['roles'])
    $urls.find('input[name="url"], input[name="key"]').blur(e => {
      const url = $urls.find('input[name="url"]').val().trim()
      const key = $urls.find('input[name="key"]').val().trim()
      if (!url || !key) {
        return $advance.hide()
      }
      $advance.show()

      getStatus(url, key)
      getTrackers(url, key)
    })

    // number, interval
    $.each(['number', 'interval'], (i, name) => {
      $('#' + name).multipleSelect({
        width: '100%',
        single: true,
        name
      }).multipleSelect('setSelects', [settings(name)])
    })
  }

  const getStatus = (url, key) => {
    $.getJSON(url.replace(/\/$/, '') + '/issue_statuses.json?key=' + key).then(res => {
      const html = []
      res.issue_statuses.forEach(item => {
        html.push(`<option value="${item.id}">${item.name}</option>`)
      })
      $('#status, #notify_status').html(html.join(''))

      if (!settings('status').length) {
        settings('status', res.issue_statuses.map(item => item.id))
      }
      if (!settings('notify_status').length) {
        settings('notify_status', res.issue_statuses.map(item => item.id))
      }
      initMultipleSelects(['status', 'notify_status'])

      $notify.prop('checked', settings('notify'))
      // notify_status
      const updateNotifyStatus = checked => {
        $notifyStatus.multipleSelect(checked ? 'enable' : 'disable')
      }
      $notify.click(() => {
        updateNotifyStatus($notify.prop('checked'))
      })
      updateNotifyStatus(settings('notify'))
    })
  }

  const getTrackers = (url, key) => {
    $.getJSON(url.replace(/\/$/, '') + '/trackers.json?key=' + key).then(res => {
      const html = []
      res.trackers.forEach(item => {
        html.push(`<option value="${item.id}">${item.name}</option>`)
      })
      $('#trackers').html(html.join(''))

      if (!settings('trackers').length) {
        settings('trackers', res.trackers.map(item => item.id))
      }
      initMultipleSelects(['trackers'])
    })
  }

  const initMultipleSelects = ids => {
    $.each(ids, (i, name) => {
      $('#' + name).multipleSelect({
        width: '100%',
        selectAll: false,
        countSelected: false
      }).multipleSelect('setSelects', settings(name))
    })
  }

  const save = () => {
    const urls = []
    const keys = []

    $urls.find('input[name="url"]').each((i, el) => {
      const url = $(el).val().trim()
      if (url) {
        urls.push(url.replace(/\/$/, ''))
      }
    })
    $urls.find('input[name="key"]').each((i, el) => {
      keys.push($.trim($(el).val()))
    })
    settings('urls', urls)
    settings('firstStart', false)
    settings('keys', keys)
    settings('roles', $roles.multipleSelect('getSelects'))
    settings('status', $status.multipleSelect('getSelects').map(i => {
      return +i
    }))
    settings('trackers', $trackers.multipleSelect('getSelects').map(i => {
      return +i
    }))
    settings('number', +($number.multipleSelect('getSelects')[0]))
    settings('interval', +($interval.multipleSelect('getSelects')[0]))
    settings('notify', $notify.prop('checked'))
    settings('notify_status', $notifyStatus.multipleSelect('getSelects').map(i => {
      return +i
    }))

    window.alert(locale.save_successful)
    chrome.extension.getBackgroundPage().background.reset()
  }

  util.initLocale(init)
})
