import { ipcRenderer, contextBridge } from 'electron'


contextBridge.exposeInMainWorld('electronAPI', {
  doneClicked: () => ipcRenderer.send('done-clicked')
});

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}
const isHiddenWindow = document.title === 'Hidden Scraper'
if (isHiddenWindow) {
  window.addEventListener('DOMContentLoaded', () => {
    const webview = document.querySelector('webview') as Electron.WebviewTag | null
    if (webview) {
      webview.addEventListener('dom-ready', () => {
        // webview.openDevTools()
      })

      window.addEventListener('message', (event) => {
        if (event.data.type === 'scrape-result') {
          ipcRenderer.send('scrape-result', event.data.result)
        }
      })

      // Listen for URL loading requests from the main process
      ipcRenderer.on('load-url-in-webview', (event, url) => {
        webview.src = url
      })

      // Listen for script execution requests from the main process
      ipcRenderer.on('execute-script-in-webview', (event, scriptContent) => {
        let execution = webview.executeJavaScript(scriptContent)
        console.log('scriptContent', scriptContent)
        console.log('execution', execution)
      })

      ipcRenderer.on('load-script-in-webview', (event, data) => {
        const script = document.createElement('script')
        script.innerHTML = data
        document.body.appendChild(script)
      })
    }
  })
} else {
  // --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// --------- Preload scripts loading ---------

}
