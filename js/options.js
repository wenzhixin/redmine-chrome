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
      getStatus()
      getTrackers()
    } else {
      $addUrl.trigger('click')
      $urls.find('input[name="url"]').focus().keyup(e => {
        if ($.trim($(e.currentTarget).val())) {
          $advance.show()
        } else {
          $advance.hide()
        }
      })
    }

    $urls.find('input[name="url"], input[name="key"]').blur(e => {
      getStatus()
      getTrackers()
    })

    initMultipleSelects()

    // number, interval
    $.each(['number', 'interval'], (i, name) => {
      $('#' + name).multipleSelect({
        width: '100%',
        single: true,
        name: name
      }).multipleSelect('setSelects', [settings(name)])
    })

    $notify.prop('checked', settings('notify'))
    // notify_status
    const updateNotifyStatus = checked => {
      $notifyStatus.multipleSelect(checked ? 'enable' : 'disable')
    }
    $notify.click(() => {
      updateNotifyStatus($notify.prop('checked'))
    })
    updateNotifyStatus(settings('notify'))
  }

  const getStatus = () => {
    let url = $urls.find('input[name="url"]').val().trim()
    const key = $urls.find('input[name="key"]').val().trim()

    if (!url || !key) return
    url = url.replace(/\/$/, '') + '/issue_statuses.json?key=' + key
    $.getJSON(url).then(res => {
      const html = []
      res.issue_statuses.forEach(item => {
        html.push(`<option value="${item.id}">${item.name}</option>`)
      })
      $('#status, #notify_status').html(html.join(''))
      initMultipleSelects()
    })
  }
  const getTrackers = () => {
    let url = $urls.find('input[name="url"]').val().trim()
    const key = $urls.find('input[name="key"]').val().trim()

    if (!url || !key) return
    url = url.replace(/\/$/, '') + '/trackers.json?key=' + key
    $.getJSON(url).then(res => {
      const html = []
      res.trackers.forEach(item => {
        html.push(`<option value="${item.id}">${item.name}</option>`)
      })
      $('#trackers').html(html.join(''))
      initMultipleSelects()
      if (settings('firstStart') && !$('#trackers').multipleSelect('getSelects').length) {
        $('#trackers').multipleSelect('checkAll')
      }
    })
  }

  const initMultipleSelects = () => {
    // roles, status, notify_status, trackers
    $.each(['roles', 'status', 'notify_status', 'trackers'], (i, name) => {
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
