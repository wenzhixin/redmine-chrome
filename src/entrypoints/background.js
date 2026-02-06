import Utils from '@/utils'
import { onMessage } from '@/utils/messaging'

class Background {
  constructor () {
    this.unreadCount = 0
    this.keepAliveIntervalId = null
    this.alarmListener = null

    this.init()
  }

  async init () {
    try {
      if (!await this.initOptions()) {
        return
      }

      // Create and store the alarm listener for this instance
      this.alarmListener = alarm => {
        if (alarm.name === 'refreshAlarm') {
          this.initRequest().catch(error => {
            console.error('Error in initRequest from alarm:', error)
          })
        }
      }
      chrome.alarms.onAlarm.addListener(this.alarmListener)

      // Ensure alarm is set (in case SW was terminated)
      await this.ensureAlarm()

      // Start periodic alarm check (every minute)
      this.startAlarmKeepAlive()

      await this.initRequest()
    } catch (error) {
      console.error('Error initializing background:', error)
    }
  }

  async ensureAlarm () {
    const alarms = await chrome.alarms.getAll()
    const refreshAlarm = alarms.find(alarm => alarm.name === 'refreshAlarm')
    const interval = this.options?.interval || 5

    if (!refreshAlarm) {
      console.log('No alarm found, creating new one with interval:', interval, 'minutes')
      chrome.alarms.create('refreshAlarm', {
        periodInMinutes: interval
      })
    } else if (refreshAlarm.periodInMinutes !== interval) {
      console.log('Alarm interval mismatch. Current:', refreshAlarm.periodInMinutes, 'Expected:', interval, '. Recreating alarm...')
      await chrome.alarms.clear('refreshAlarm')
      chrome.alarms.create('refreshAlarm', {
        periodInMinutes: interval
      })
      console.log('Alarm recreated with interval:', interval, 'minutes')
    } else {
      console.log('Alarm exists with correct interval:', interval, 'minutes')
    }
  }

  startAlarmKeepAlive () {
    // Check if alarm exists every minute
    this.keepAliveIntervalId = setInterval(() => {
      this.ensureAlarm().catch(error => {
        console.error('Error in alarm keep-alive check:', error)
      })
    }, 60000) // Check every minute
  }

  async initOptions () {
    this.options = await Utils.getStorage('options')

    if (!this.options) {
      chrome.tabs.create({
        url: chrome.runtime.getURL('options.html')
      })
      return false
    }

    // Validate options structure
    if (!this.options.url || !this.options.key) {
      console.error('Invalid options: missing url or key')
      chrome.tabs.create({
        url: chrome.runtime.getURL('options.html')
      })
      return false
    }

    // Ensure issues is a valid array
    if (!this.options.issues || !Array.isArray(this.options.issues)) {
      console.warn('Invalid options.issues, defaulting to ["assigned_to_id"]')
      this.options.issues = ['assigned_to_id']
    }

    // Ensure interval is valid (between 1 and 30 minutes)
    if (!this.options.interval || this.options.interval < 1 || this.options.interval > 30) {
      console.warn('Invalid options.interval, defaulting to 5 minutes')
      this.options.interval = 5
    }

    // Ensure number is valid
    if (!this.options.number || this.options.number < 1) {
      console.warn('Invalid options.number, defaulting to 25')
      this.options.number = 25
    }

    this.data = await Utils.getStorage('data') || {}
    return true
  }

  async initRequest () {
    try {
      this.error = false
      console.log('Starting initRequest...')

      // Reload data from storage to get the latest state (e.g., lastRead, readList)
      this.data = await Utils.getStorage('data') || this.data

      // Ensure options.issues exists and is an array
      if (!this.options.issues || !Array.isArray(this.options.issues)) {
        console.error('options.issues is not properly defined:', this.options.issues)
        this.error = true
      } else {
        for (const role of this.options.issues) {
          console.log(`Processing role: ${role}`)
          await this.getList(role)
        }

        await Utils.setStorage('data', this.data)
        console.log('initRequest completed successfully')
      }
    } catch (error) {
      console.error('Error in initRequest:', error)
      this.error = true
    } finally {
      // Always update badge text
      Utils.setBadgeText(this.error ? 'x' : this.unreadCount > 0 ? `${this.unreadCount}` : '')
      this.unreadCount = 0
    }
  }

  setQuery (query, name, values) {
    query[name] = values.join('|')
  }

  async getList (role) {
    try {
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

      const res = await Utils.getAPI(this.options, 'issues', query)
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
            unreadList.push(uuid)
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
    } catch (error) {
      console.error(`Error fetching list for role ${role}:`, error)
      this.data[role].error = true
      this.error = true
    }
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
    // Clear all alarms and refresh immediately
    chrome.alarms.clearAll().then(() => {
      this.initRequest()
    })
  }

  destroy () {
    if (this.alarmListener) {
      chrome.alarms.onAlarm.removeListener(this.alarmListener)
      this.alarmListener = null
    }

    // Clear the keep-alive interval to prevent memory leaks
    if (this.keepAliveIntervalId !== null) {
      clearInterval(this.keepAliveIntervalId)
      this.keepAliveIntervalId = null
    }

    // Clear all alarms
    chrome.alarms.clearAll()
  }

  reset () {
    Utils.setBadgeText('')
    Utils.setStorage('data', {})
    this.refresh()
  }
}

export default defineBackground(() => {
  let background = new Background()

  // Add error handling for unhandled promise rejections
  self.addEventListener('unhandledrejection', event => {
    console.error('Background service worker unhandled rejection:', event.reason)
  })

  // Add error handling for general errors
  self.addEventListener('error', event => {
    console.error('Background service worker error:', event.error)
  })

  onMessage('OPTIONS_SAVED', async () => {
    try {
      background?.destroy()
      // Wait a bit to ensure storage is fully written before creating new instance
      await new Promise(resolve => setTimeout(resolve, 100))
      background = new Background()
      return { success: true }
    } catch (error) {
      console.error('Error handling OPTIONS_SAVED:', error)
      return { success: false, error: error.message }
    }
  })

  return () => {
    background?.destroy()
  }
})
