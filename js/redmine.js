$(() => {
  const $body = $('body')
  const $main = $('#main')
  const $sidebar = $('#sidebar')
  const $content = $('#content')
  let $toggle
  let hidden = (localStorage && +localStorage['redmine.hidden']) || 0

  const initView = () => {
    $body.append([
      '<div class="redmine-pluin-tools">',
      '<a class="plugin-toggle" href="javascript:">',
      '<i class="fa fa-angle-double-right"></i>',
      '</a>',
      '<hr>',
      '<a class="plugin-back-to-top" href="#top" title="Back to top">',
      '<i class="fa fa-arrow-up"></i>',
      '</a>',
      '</div>'
    ].join(''))

    // toggle
    $toggle = $('.redmine-pluin-tools > .plugin-toggle')

    $toggle.click(() => {
      hidden = hidden === 0 ? 1 : 0
      if (localStorage) localStorage['redmine.hidden'] = hidden
      onToggle()
    })

    // check json
    $('pre code.json').each((i, el) => {
      const text = $.map($(el).text().split('\n'), str => {
        return $.trim(str)
      }).join('\n')
      let alert = ''

      try {
        checkKey(jsonlint.parse(text))
      } catch (e) {
        alert = e
      }
      if (alert) {
        $(el).parent().after('<pre>' + alert + '</pre>')
      }
    })
  }

  const onToggle = () => {
    if (hidden) {
      hideSidebar()
    } else {
      showSidebar()
    }
  }

  const hideSidebar = () => {
    $toggle.find('i').removeClass('fa-angle-double-right')
      .addClass('fa-angle-double-left')
    $sidebar.hide()
    $content.css('width', '98%')
  }

  const showSidebar = () => {
    $toggle.find('i').removeClass('fa-angle-double-left')
      .addClass('fa-angle-double-right')
    $sidebar.show()
    $content.css('width', '75%')
  }

  const check = callback => {
    chrome.extension.sendRequest({
      method: 'getUrls'
    }, response => {
      let result = false

      $.each(response.urls, (i, url) => {
        if (window.location.href.indexOf(url) !== -1) {
          result = true
          return false
        }
      })

      callback(result && !$main.hasClass('nosidebar'))
    })
  }

  check(result => {
    if (!result) {
      return
    }
    initView()
    onToggle()
  })

  const checkKey = obj => {
    if ($.isArray(obj)) {
      $.each(obj, (i, value) => {
        checkKey(value)
      })
    }
    if ($.isPlainObject(obj)) {
      for (const key in obj) {
        if (/[A-Z]/.test(key)) {
          throw new Error('Key "' + key + '" can not use Upper Case...')
        }
        checkKey(obj[key])
      }
    }
  }
})
