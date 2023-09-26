import axios from 'axios'

export default {
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

  getAPI (name, params) {
    const baseUrl = window.options.url.endsWith('/') ?
      window.options.url.slice(0, -1) : window.options.url

    return axios.get(`${baseUrl}/${name}.json`, {
      params: {
        key: window.options.key,
        limit: 100,
        ...params
      }
    }).then(res => res.data[name] || res.data)
  }
}
