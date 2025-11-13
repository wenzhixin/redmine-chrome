import Utils from '@/utils'
import { onMessage } from '@/utils/messaging'

class Background {
  constructor () {
    this.timeoutId = 0
    this.unreadCount = 0

    this.init()
  }

  async init () {
    if (!await this.initOptions()) {
      return
    }
    this.initRequest()
  }

  async initOptions () {
    this.options = await Utils.getStorage('options')

    if (!this.options) {
      chrome.tabs.create({
        url: chrome.runtime.getURL('options.html')
      })
      return false
    }

    this.data = await Utils.getStorage('data') || {}
    return true
  }

  async initRequest () {
    this.error = false

    for (const role of this.options.issues) {
      await this.getList(role)
    }

    Utils.setStorage('data', this.data)

    Utils.setBadgeText(this.error ? 'x' : this.unreadCount > 0 ? `${this.unreadCount}` : '')
    this.unreadCount = 0
    this.timeoutId = setTimeout(() => {
      this.initRequest()
    }, this.options.interval * 60 * 1000)
  }

  setQuery (query, name, values) {
    query[name] = values.join('|')
  }

  getList (role) {
    const query = {
      set_filter: 1,
      sort: 'updated_on:desc',
      limit: this.options.number,
      key: this.options.key,
      [role]: 'me'
    }

    // this.setQuery(query, 'project_id', this.options.projects)
    this.setQuery(query, 'status_id', this.options.status)
    this.setQuery(query, 'tracker_id', this.options.trackers)

    if (!this.data[role]) {
      this.data[role] = {}
    }

    return Utils.getAPI(this.options, 'issues', query).then(res => {
      const lastRead = new Date(0)
      const lastNotified = new Date(0)
      const unreadList = []
      let readList = []

      this.data[role].issues = Utils.filterIssues(res, this.data, role)
      this.data[role].error = false

      if (this.data[role].lastRead) {
        lastRead.setTime(this.data[role].lastRead)
      }

      if (this.data[role].lastNotified) {
        lastNotified.setTime(this.data[role].lastNotified)
      }

      if (this.data[role].readList) {
        readList = this.data[role].readList
      } else {
        this.data[role].readList = []
      }

      let count = 0

      for (let i = this.data[role].issues.length - 1; i >= 0; i--) {
        const issue = this.data[role].issues[i]
        const updatedOn = new Date(issue.updated_on)
        const uuid = Utils.getUUID(issue)

        if (lastRead < updatedOn) {
          if (!readList.includes(uuid)) {
            count++
            unreadList.push(Utils.getUUID(issue))
          }
        }
        if (lastNotified < updatedOn) {
          lastNotified.setTime(updatedOn.getTime())
          if (count < 4) {
            this.showNotification(issue)
          }
        }
      }

      this.data[role].lastNotified = lastNotified.getTime()
      this.data[role].unreadList = unreadList
      this.unreadCount += count
    }).catch(() => {
      this.data[role].error = true
      this.error = true
    })
  }

  showNotification (issue) {
    if (
      !this.options.notify ||
      !this.options.notify_status.includes(issue.status.id)
    ) {
      return
    }

    chrome.notifications.create(`${new Date().getTime()}`, {
      type: 'basic',
      title: issue.subject,
      message: Utils.convertTextile(issue.description).replace(/<[^>]+>/g, ''),
      iconUrl: chrome.runtime.getURL('icon-128.png')
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

  destroy () {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }

  reset () {
    Utils.setBadgeText('')
    Utils.setStorage('data', {})
    this.refresh()
  }
}

export default defineBackground(() => {
  let background = new Background()

  onMessage('OPTIONS_SAVED', () => {
    background?.destroy()
    background = new Background()
    return { success: true }
  })

  return () => {
    background?.destroy()
  }
})
