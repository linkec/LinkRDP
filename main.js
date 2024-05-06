// Modules to control application life and create native browser window
const { app, BrowserWindow, desktopCapturer, ipcMain, screen } = require('electron')
const { mouse, Point, keyboard } = require("@nut-tree/nut-js")
const http = require('http');
const fs = require('fs');


const path = require('node:path')

function createWebRTCWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,

  })
  // 移动到最左边
  mainWindow.setPosition(0, 0)

  // and load the index.html of the app.
  mainWindow.loadURL('chrome://webrtc-internals')
}

function createWebService() {
  const server = http.createServer((req, res) => {
    const target = req.url === '/' ? '/index.html' : req.url;
    fs.readFile(path.join(__dirname, 'web', target), (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        return res.end('404 Not Found');
      }

      const mime = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
      }
      const ext = path.extname(target);
      res.writeHead(200, { 'Content-Type': mime[ext] || 'text/html' });
      res.write(data);
      return res.end();
    })
  });

  server.listen(5500);
  console.log('Server is listening on port 5500');
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  // mainWindow.webContents.openDevTools()
  mainWindow.loadFile('index.html')

  // mouse.move(new Point(100, 100));

  ipcMain.handle('tools:get-sources', async (event, args) => {
    return await desktopCapturer.getSources({
      types: ['screen'], thumbnailSize: {
        width: 0,
        height: 0
      }
    }).then(async sources => {
      const displays = screen.getAllDisplays();
      // console.log({ displays })
      // console.log({ sources })

      const data = []
      for (const source of sources) {
        const display = displays.find(display => display.id.toString() === source.display_id)
        data.push({
          id: source.id,
          name: source.name,
          bounds: display.bounds,
        })
      }

      console.log(data)
      return data
    })
  })

  ipcMain.on('mouse-move', (event, args) => {
    mouse.move(new Point(args.x, args.y));
  })

  ipcMain.on('mouse-lclick', (event, args) => {
    mouse.leftClick();
  })

  ipcMain.on('mouse-rclick', (event, args) => {
    mouse.rightClick();
  })

  ipcMain.on('mouse-dclick', (event, args) => {
    mouse.doubleClick();
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  // createWebRTCWindow()
  createWebService()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
