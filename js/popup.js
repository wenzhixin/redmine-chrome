/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

class Popup {
  constructor () {
    this.$options = $('.options')
    this.$main = $('.main')
    this.$urls = $('#urls')
    this.$roles = $('#roles')
    this.$issues = $('#issues')
    this.$detail = $('.issue-detail')

    this.init()
  }

  init () {
    this.initView()
    this.initUrls()
    this.initRoles()
    this.initIssues()
  }

  initView () {
    if (!settings('urls').length) {
      return
    }
    this.$options.hide()
    this.$main.show()
  }

  initUrls () {
    const html = []

    $.each(settings('urls'), (i, url) => {
      html.push(util.sprintf('<option value="%s">%s</option>', i, url))
    })
    if (settings('urls').length > 1) {
      this.$urls.show().html(html.join('')).change(e => {
        settings('url_index', $(e.currentTarget)[0].selectedIndex)
        this.initRoles()
        this.initIssues()
      })[0].selectedIndex = settings('url_index')
    }
  }

  initRoles () {
    const html = []

    $.each(settings('roles'), (i, role) => {
      const data = settings('data')[this.getKey(role)]

      if (data.error) {
        return
      }

      html.push(util.sprintf($('#roleTpl').html(),
        i,
        locale['roles_' + role],
        data.issues.length,
        data.unreadList.length === 0 ? 'none' : ' ',
        data.unreadList.length
      ))
    })
    if (settings('roles').length > 1) {
      this.$roles.show().html(html.join(''))
        .find('li').click(e => {
          settings('role_index', $(e.currentTarget).index())
          $(e.currentTarget).addClass('active').siblings().removeClass('active')
          this.initIssues()
        }).eq(settings('role_index')).addClass('active')
    }
  }

  initIssues () {
    const html = [$('#sortTpl').html()]
    const url = settings('urls')[settings('url_index')]
    const data = settings('data')[this.getKey()]
    let issues = data.issues

    if (data.error) {
      this.$issues.html([
        '<div class="options">',
        '<a href="options.html" target="_blank">',
        locale.settings_error,
        '</a>',
        '</div>'
      ].join(''))
      return
    }

    issues = util.sortIssues(data.issues, data.unreadList)
    html.push(util.sprintf($('#markTpl').html(),
      data.unreadList.length ? ' ' : 'none'))

    $.each(issues, (i, issue) => {
      html.push(util.sprintf($('#issueTpl').html(),
        $.inArray(util.getIuid(issue), data.unreadList) === -1 ? '' : 'fb',
        i,
        util.getPriorityLabel(issue.priority.name),
        issue.priority.name,
        issue.status.name,
        issue.project.name,
        moment(new Date(issue.updated_on)).format('YYYY-MM-DD HH:mm:ss'),
        moment(new Date(issue.updated_on)).fromNow(),
        url + '/issues/' + issue.id,
        issue.tracker.name,
        issue.id,
        issue.subject
      ))
    })
    this.$issues.scrollTop(0).html(html.join(''))
      .find('.mark-all').off('click').on('click', e => {
        $(e.currentTarget).hide()
        this.$issues.find('.list-group-item').removeClass('fb')
        this.setUnreadCount(0, settings('unread') - data.unreadList.length)
        this.resetUnreadData()
      }).end()
      .find('.list-group-item')
      .off('click').on('click', e => {
        $(e.currentTarget).removeClass('fb')
        this.showIssue(issues[$(e.currentTarget).data('index')])
      }).end()
      .find('.order-by li')
      .off('click').on('click', e => {
        settings('order', $(e.currentTarget).data('order'))
        this.initIssues()
      })
      .filter(util.sprintf('[data-order="%s"]', settings('order')))
      .addClass('active')

    util.setLocale(this.$issues)
    this.$issues.find('.copy-issue').off('click').on('click', e => {
      e.stopImmediatePropagation()

      const index = $(e.currentTarget).parents('.list-group-item').data('index')
      util.copyText('#' + issues[index].id)
    })
    this.$issues.find('[data-toggle="tooltip"]').tooltip({
      placement: 'bottom'
    })
  }

  updateIssues (issue) {
    const data = settings('data')
    const issues = data[this.getKey()].issues

    for (let i = 0; i < issues.length; i++) {
      if (issues[i].id === issue.id) {
        issues[i] = issue
        const status = settings('status').map(i => {
          return +i
        })
        if (status.indexOf(issue.status.id) === -1) {
          issues.splice(i, 1)
          this.$issues.find('[data-index="' + i + '"]').remove()
        }
        settings('data', data)
      }
    }
  }

  showIssue (issue) {
    const url = settings('urls')[settings('url_index')] + '/issues/' + issue.id
    const key = settings('keys')[settings('url_index')]

    this.getIssue(issue, url, key, (issue, error) => {
      this.updateIssues(issue)
      issue = $.extend({}, {
        tracker: {
          name: ''
        },
        status: {
          name: ''
        },
        priority: {
          name: ''
        },
        assigned_to: {
          name: ''
        },
        author: {
          name: ''
        }
      }, issue)

      this.$main.hide()
      this.$detail.show().html(util.sprintf($('#detailTpl').html(),
        url,
        issue.tracker.name,
        issue.id,
        issue.subject,
        issue.status.name,
        issue.priority.name,
        issue.assigned_to.name,
        issue.author.name,
        util.convertTextile(issue.description)
      ))
        .find('img').hide().end()
        .css('padding-top', this.$detail.find('.detail-header').height())

      this.$detail.find('.close, .btn-close').off('click').on('click', () => {
        this.$detail.hide()
        this.$main.show()
      })

      util.setLocale(this.$detail)
      this.$detail.find('.copy-issue').off('click').on('click', () => {
        util.copyText('#' + issue.id)
      })
      this.$detail.find('[data-toggle="tooltip"]').tooltip({
        placement: 'bottom'
      })

      this.updateUnreadCount(issue)
      if (!error) {
        this.updateIssue(url)
        this.showEdit(issue, url)
      }
    })
  }

  getIssue (issue, url, key, callback) {
    $.ajax({
      url: url + '.json',
      data: {
        key
      },
      timeout: 1000,
      success: res => {
        callback(res.issue)
      },
      error: () => {
        callback(issue, true)
      }
    })
  }

  updateIssue (url) {
    $.get(url, res => {
      const $description = $(res).find('.issue .wiki')
      const $history = $(res).find('#history')

      if ($description.length) {
        this.$detail.find('.desc-detail').html($description.html())
      }

      if ($history.length) {
        this.$detail.find('.history').html($history.html())
      }
      this.$detail.find('a').each((i, el) => {
        const $this = $(el)
        const href = $this.attr('href')

        if (href === '#' || href === 'javascript:void(0)') {
          $this.remove()
          return
        }
        $this.attr('href', util.getUrl(url, href)).attr('target', '_blank')
      })
      this.$detail.find('img').each((i, el) => {
        const src = util.getUrl(url, $(el).attr('src'))
        $(el).attr('src', src)
        $(el).wrap(util.sprintf('<a href="%s" target="_blank"></a>', src))
      }).show()

      // update table
      this.$detail.find('table').addClass('table table-bordered')
    })
  }

  showEdit (issue, url) {
    const editors = settings('editors')

    $.get(url + '/edit', res => {
      const $res = $(res)
      const $edit = this.$detail.find('.edit').show()

      $.each([
        'issue[status_id]:status.id',
        'issue[done_ratio]:done_ratio',
        'issue[priority_id]:priority.id',
        'issue[assigned_to_id]:assigned_to.id'
      ], (i, name) => {
        const names = name.split(':')

        name = util.sprintf('[name="%s"]', names[0])
        $edit.find(name).html($res.find(name).html())
          .val(util.getValueByString(issue, names[1]))
      })
      $edit.find('[name="authenticity_token"]')
        .val($res.find('[name="authenticity_token"]').val())

      // fix #29
      $edit.find('[name="issue[status_id]"]').on('change', e => {
        $('[name="issue[done_ratio]"]').val(+$(e.currentTarget).val() === 3
          ? '100'
          : $res.find('[name="issue[done_ratio]"]').val())
      })

      /* eslint-disable new-cap */
      const toolbar = new jsToolBar($edit.find('textarea')[0])
      toolbar.setHelpLink('http://www.redmine.org/help/en/wiki_syntax.html')
      toolbar.draw()

      // fix #43: save editor
      let saveTimeout = 0
      const saveEditor = () => {
        editors[issue.id] = $edit.find('textarea').val()
        settings('editors', editors)
      }
      $edit.find('textarea').on('keyup focus', () => {
        clearTimeout(saveTimeout)
        saveTimeout = setTimeout(saveEditor, 500)
      }).val(settings('editors')[issue.id] || '')

      $edit.off('submit').on('submit', e => {
        e.preventDefault()

        $(e.currentTarget).find(':submit').prop('disabled', true)

        $.ajax({
          url,
          type: 'POST',
          cache: false,
          contentType: false,
          processData: false,
          data: new window.FormData($(e.currentTarget)[0]),
          success: () => {
            delete editors[issue.id]
            settings('editors', editors)
            this.showIssue(issue)
          }
        })
      })
    })
  }

  updateUnreadCount (issue) {
    const data = settings('data')
    const curData = data[this.getKey()]
    const iuid = util.getIuid(issue)
    const index = $.inArray(iuid, curData.unreadList)

    if (index !== -1) {
      curData.unreadList.splice(index, 1)
      this.setUnreadCount(curData.unreadList.length, settings('unread') - 1)

      if (curData.unreadList.length) {
        curData.readList.push(iuid)
        data[this.getKey()] = curData
        settings('data', data)
      } else {
        this.resetUnreadData()
      }

      // fix #11: hide mark all as read
      if (curData.unreadList.length === 0) {
        this.$issues.find('.mark-all').hide()
      }
    } else if ($.inArray(util.getIuid(issue), curData.readList) === -1) {
      curData.readList.push(iuid)
      curData.lastNotified = +new Date()
      data[this.getKey()] = curData
      settings('data', data)
    }
  }

  setUnreadCount (roleCount, count) {
    const $role = this.$roles.find('li').eq(settings('role_index'))

    if (roleCount) {
      $role.find('.label-info').text(roleCount)
    } else {
      $role.find('.label-info').hide()
    }
    settings('unread', count)
    chrome.browserAction.setBadgeText({
      text: count > 0 ? count + '' : ''
    })
  }

  resetUnreadData () {
    const data = settings('data')
    data[this.getKey()].lastRead = +new Date()
    data[this.getKey()].unreadList = []
    data[this.getKey()].readList = []
    settings('data', data)
  }

  getKey (role) {
    const url = settings('urls')[settings('url_index')]

    role = role || settings('roles')[settings('role_index')]
    return $.md5(url + role)
  }
}

$(() => {
  'use strict'

  moment.lang(settings('language').toLowerCase())

  util.initLocale(() => {
    /* eslint-disable no-new */
    new Popup()
  })
})
