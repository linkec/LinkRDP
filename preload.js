/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getSources: async () => {
    return await ipcRenderer.invoke('tools:get-sources')
  },
  mouseMove: (x, y) => ipcRenderer.send('mouse-move', { x, y }),
  mouseLClick: () => ipcRenderer.send('mouse-lclick'),
  mouseRClick: () => ipcRenderer.send('mouse-rclick')
})
