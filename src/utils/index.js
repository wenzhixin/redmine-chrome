export default {
  setBadgeText (text) {
    chrome.action.setBadgeText({ text })
  },

  async getBadgeText () {
    if (chrome?.action) {
      return chrome.action.getBadgeText({})
    }
    return ''
  },

  setStorage (key, value) {
    if (chrome?.storage?.local) {
      return chrome.storage.local.set({ [key]: JSON.stringify(value) })
    }
    localStorage[key] = JSON.stringify(value)
  },

  async getStorage (key = 'options') {
    if (chrome?.storage?.local) {
      const res = await chrome.storage.local.get([key])

      return res[key] && JSON.parse(res[key])
    }
    return localStorage[key] && JSON.parse(localStorage[key])
  },

  async getAPI (options, name, params = {}) {
    const baseUrl = options.url.endsWith('/') ?
      options.url.slice(0, -1) : options.url
    const urlParams = new URLSearchParams()

    urlParams.append('key', options.key)
    for (const [key, value] of Object.entries(params)) {
      urlParams.append(key, value)
    }

    const url = `${baseUrl}/${name}.json?${urlParams.toString()}`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      return data[name] || data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  },

  filterIssues (issues, data, role) {
    return issues.filter(issue => {
      for (const [key, obj] of Object.entries(data)) {
        if (key === role) {
          return true
        }
        if (obj.issues.find(item => item.id === issue.id)) {
          return false
        }
      }
      return true
    })
  },

  getUUID (issue) {
    return issue.id + new Date(issue.updated_on).getTime()
  },

  convertTextile (text) {
    if (!text) {
      return ''
    }

    try {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\n/g, '<br>')
    } catch (error) {
      console.error('Textile conversion error:', error)
      return text
    }
  },

  copyIssueId (id) {
    navigator.clipboard.writeText(`#${id}`)
  }
}
