import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: () => ({
    name: 'Redmine Notification',
    permissions: ['alarms', 'notifications', 'storage'],
    host_permissions: ['http://*/*', 'https://*/*'],
    action: {
      default_icon: {
        16: 'icon-128.png',
        32: 'icon-128.png',
        48: 'icon-128.png',
        128: 'icon-128.png'
      },
      default_title: 'Redmine Notification'
    },
    browser_action: {
      default_icon: {
        16: 'icon-128.png',
        32: 'icon-128.png',
        48: 'icon-128.png',
        128: 'icon-128.png'
      },
      default_title: 'Redmine Notification'
    }
  }),
  srcDir: 'src',
  outDir: 'output',
  modules: [
    '@wxt-dev/module-vue'
  ],
  imports: {
    eslintrc: {
      enabled: 9
    }
  },
  vite: () => ({
    server: {
      host: '0.0.0.0',
      https: false,
      hotOnly: false,
      proxy: {
        '/redmine': {
          changeOrigin: true,
          target: 'https://redmine.scutech.com'
        }
      }
    }
  })
})
