class Redmine {
  constructor () {
    this.init()

    this.check(result => {
      if (!result) {
        return
      }
      this.initView()
      this.onToggle()
    })
  }

  init () {
    this.$body = $('body')
    this.$main = $('#main')
    this.$sidebar = $('#sidebar')
    this.$content = $('#content')
    this.hidden = localStorage && +localStorage['redmine.hidden'] || 0
  }

  initView () {
    this.$body.append([
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

    this.$toggle = $('.redmine-pluin-tools > .plugin-toggle')

    this.$toggle.on('click', () => {
      this.hidden = this.hidden === 0 ? 1 : 0
      localStorage['redmine.hidden'] = this.hidden
      this.onToggle()
    })

    // check json
    $('pre code.json').each((i, el) => {
      const text = $.map($(el).text().split('\n'), str => str.trim()).join('\n')
      const alert = ''

      try {
        this.checkKey(jsonlint.parse(text))
      } catch (e) {
        $(el).parent().after(`<pre>${alert}</pre>`)
      }
    })
  }

  onToggle () {
    if (this.hidden) {
      this.hideSidebar()
    } else {
      this.showSidebar()
    }
  }

  hideSidebar () {
    this.$toggle.find('i')
      .removeClass('fa-angle-double-right')
      .addClass('fa-angle-double-left')
    this.$sidebar.hide()
    this.$content.css('width', '98%')
  }

  showSidebar () {
    this.$toggle.find('i')
      .removeClass('fa-angle-double-left')
      .addClass('fa-angle-double-right')
    this.$sidebar.show()
    this.$content.css('width', '75%')
  }

  check (callback) {
    chrome.extension.sendRequest({
      method: 'getUrls'
    }, response => {
      let result = false

      for (const url of response.urls) {
        if (window.location.href.includes(url)) {
          result = true
          break
        }
      }

      callback(result && !this.$main.hasClass('nosidebar'))
    })
  }

  checkKey (obj) {
    if (Array.isArray(obj)) {
      for (const value of obj) {
        this.checkKey(value)
      }
    }
    if ($.isPlainObject(obj)) {
      for (const key of Object.keys(obj)) {
        if (/[A-Z]/.test(key)) {
          throw new Error(`Key "${key}" can not use Upper Case...`)
        }
        this.checkKey(obj[key])
      }
    }
  }
}

$(() => {
  new Redmine()
})
