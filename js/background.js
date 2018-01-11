/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

class Background {
  constructor () {
    this.timeoutId = 0
    this.unreadCount = 0

    this.init()
  }

  init () {
    this.initOptions()
    this.initRequest()
  }

  initOptions () {
    if (!settings('new')) {
      chrome.tabs.create({
        url: chrome.extension.getURL('options.html')
      })
      settings('new', true)
    }
  }

  initRequest () {
    const addresses = []

    this.error = false
    this.data = settings('data')
    this.keys = []
    settings('urls').forEach((url, i) => {
      addresses.push({
        url: url,
        key: settings('keys')[i] || ''
      })
    })
    async.eachSeries(addresses, (address, callback) => {
      async.eachSeries(settings('roles'), (role, callback) => {
        this.getList(address, role, callback)
      }, callback)
    }, () => {
      settings('data', this.data)
      settings('unread', this.unreadCount)
      console.log(this.error)
      chrome.browserAction.setBadgeText({
        text: this.error ? 'x' : (this.unreadCount > 0 ? this.unreadCount + '' : '')
      })
      this.unreadCount = 0
      this.timeoutId = setTimeout(() => {
        this.initRequest()
      }, settings('interval') * 60 * 1000)
    })
  }

  getList (address, role, callback) {
    const key = $.md5(address.url + role)
    const data = {
      set_filter: 1,
      sort: 'updated_on:desc',
      limit: settings('number'),
      key: address.key
    }
    if (settings('status').length) {
      data.status_id = settings('status').join('|')
    }
    if (settings('trackers').length) {
      data.tracker_id = settings('trackers').join('|')
    }

    data[role] = 'me'
    $.ajax({
      url: address.url + '/issues.json',
      data: data,
      dataType: 'json',
      success: res => {
        const lastRead = new Date(0)
        const lastNotified = new Date(0)
        const unreadList = []
        let readList = []
        const issues = util.filterIssues(this.keys, res.issues, this.data)

        this.keys.push(key)

        if (!this.data.hasOwnProperty(key)) {
          this.data[key] = {}
        }

        this.data[key].issues = issues
        this.data[key].error = false

        if (this.data[key].lastRead) {
          lastRead.setTime(this.data[key].lastRead)
        }

        if (this.data[key].lastNotified) {
          lastNotified.setTime(this.data[key].lastNotified)
        }

        if (this.data[key].readList) {
          readList = this.data[key].readList
        } else {
          this.data[key].readList = []
        }

        let count = 0
        for (let i = this.data[key].issues.length - 1; i >= 0; i--) {
          const issue = this.data[key].issues[i]
          const updatedOn = new Date(issue.updated_on)

          if (lastRead < updatedOn) {
            if ($.inArray(util.getIuid(issue), readList) === -1) {
              count++
              unreadList.push(util.getIuid(issue))
            }
          }
          if (lastNotified < updatedOn) {
            lastNotified.setTime(updatedOn.getTime())
            if (count < 4) {
              this.showNotification(issue)
            }
          }
        }

        this.data[key].lastNotified = lastNotified.getTime()
        this.data[key].unreadList = unreadList
        this.unreadCount += count
        callback()
      },
      error: () => {
        if (!this.data.hasOwnProperty(key)) {
          this.data[key] = {}
        }
        this.data[key].error = true
        this.error = true
        callback()
      }
    })
  }

  showNotification (issue) {
    if (!settings('notify')) return
    if (settings('notify_status').indexOf(issue.status.id) === -1) return

    chrome.notifications.create(new Date().getTime() + '', {
      type: 'basic',
      title: issue.subject,
      message: $('<div/>').html(util.convertTextile(issue.description)).text(),
      iconUrl: chrome.runtime.getURL('/icon128.png')
    }, id => {
      setTimeout(() => {
        chrome.notifications.clear(id, () => {})
      }, 5000)
    })
  }

  refresh () {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    this.initRequest()
  }

  reset () {
    chrome.browserAction.setBadgeText({
      text: ''
    })
    settings('data', {})
    settings('unread', 0)
    settings('url_index', 0)
    settings('role_index', 0)
    this.refresh()
  }
}

this.background = new Background()

// add listener for content scripts
chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
  switch (request.method) {
    case 'getUrls':
      sendResponse({
        urls: settings('urls')
      })
      break
    default:
      break
  }
})
