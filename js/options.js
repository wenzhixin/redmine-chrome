/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

$(function() {

  const $language = $('#language'),
    $save = $('#save'),
    $urls = $('#urls'),
    $advance = $('#advance'),
    $addUrl = $('#addUrl'),
    $roles = $('#roles'),
    $status = $('#status'),
    $trackers = $('#trackers'),
    $number = $('#number'),
    $interval = $('#interval'),
    $notify = $('#notify'),
    $notifyStatus = $('#notify_status')

  function init() {
    $('[data-toggle="tooltip"]').tooltip({
      placement: 'bottom'
    })

    // language
    $language.change(function() {
      settings('language', $(this).val())
      location.reload(true)
    }).val(settings('language'))

    $save.click(save)

    // urls
    var itemTpl = $('#itemTpl').html(),
      urlsHtml = []

    $.each(settings('urls'), function(i, url) {
      urlsHtml.push(util.sprintf(itemTpl, url, settings('keys')[i] || ''))
    })
    $urls.html(urlsHtml.join(''))
    $addUrl.click(function() {
      $urls.append(util.sprintf(itemTpl, '', ''))
    })
    $(document).on('click', '.remove-url', function() {
      $(this).parents('.input-inline').remove()
    })

    if (settings('urls').length) {
      $advance.show()
      getStatus();
      getTrackers();
    } else {
      $addUrl.trigger('click')
      $urls.find('input[name="url"]').focus().keyup(function() {
        if ($.trim($(this).val())) {
          $advance.show()
        } else {
          $advance.hide()
        }
      })
    }

    $urls.find('input[name="url"], input[name="key"]').blur(function(){
        getStatus();
        getTrackers();
    });

    initMultipleSelects()

    // number, interval
    $.each(['number', 'interval'], function(i, name) {
      var $name = $('#' + name).multipleSelect({
        width: '100%',
        single: true,
        name: name
      }).multipleSelect('setSelects', [settings(name)])
    })

    $notify.prop('checked', settings('notify'))
    // notify_status
    var updateNotifyStatus = function(checked) {
      $notifyStatus.multipleSelect(checked ? 'enable' : 'disable')
    }
    $notify.click(function() {
      updateNotifyStatus($notify.prop('checked'))
    })
    updateNotifyStatus(settings('notify'))
  }

  function getStatus() {
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

  function getTrackers(){
      let url = $urls.find('input[name="url"]').val().trim();
      const key = $urls.find('input[name="key"]').val().trim();

      if(!url || !key) return;
      url = url.replace(/\/$/, '') + '/trackers.json?key=' + key;
      $.getJSON(url).then(res => {
          const html = []
          res.trackers.forEach(item => {
          html.push(`<option value="${item.id}">${item.name}</option>`)
      });
      $('#trackers').html(html.join(''));
      initMultipleSelects()
    });
  }

    function initMultipleSelects() {
    // roles, status, notify_status, trackers
    $.each(['roles', 'status', 'notify_status', 'trackers'], function(i, name) {
      $('#' + name).multipleSelect({
        width: '100%',
        selectAll: false,
        countSelected: false
      }).multipleSelect('setSelects', settings(name))
    })
  }

  function save() {
    var urls = [],
      keys = []

    $urls.find('input[name="url"]').each(function() {
      var url = $(this).val().trim()
      if (url) {
        urls.push(url.replace(/\/$/, ''))
      }
    })
    $urls.find('input[name="key"]').each(function() {
      keys.push($.trim($(this).val()))
    })
    settings('urls', urls)
    settings('keys', keys)
    settings('roles', $roles.multipleSelect('getSelects'))
    settings('status', $status.multipleSelect('getSelects').map(function(i) {
      return +i
    }))
    settings('trackers', $trackers.multipleSelect('getSelects').map(function(i) {
        return +i
    }))
    settings('number', +($number.multipleSelect('getSelects')[0]))
    settings('interval', +($interval.multipleSelect('getSelects')[0]))
    settings('notify', $notify.prop('checked'))
    settings('notify_status', $notifyStatus.multipleSelect('getSelects').map(function(i) {
      return +i
    }))

    alert(locale.save_successful)
    chrome.extension.getBackgroundPage().background.reset()
  }

  util.initLocale(init)
})
