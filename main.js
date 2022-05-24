const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const path = require("path");
const { menu } = require("./menu");

let mainWindow;

const isWindows = process.platform === "win32";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
      // (NOT RECOMMENDED)
      // If true, we can skip attaching functions from ./menu-functions.js to window object in preload.js.
      // And, instead, we can use electron APIs directly in renderer.js
      // From Electron v5, nodeIntegration is set to false by default. And it is recommended to use preload.js to get access to only required Node.js apis.
      // nodeIntegration: true
    },
    frame: isWindows ? false : true //Remove frame to hide default menu
  });
  const tray = new Tray('image.ico');
  tray.setToolTip("Tray to electron app");
  tray.on('click', () => {
    mainWindow.isVisible()?mainWindow.hide():mainWindow.show();
  });
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Show App', click: function () {
        mainWindow.show();
      }
    },
    {
      label: 'Quit', click: function () {
        isQuiting = true;
        // BrowserWindow.closable = true;
        app.quit();
        // e.preventDefault();
        

      }
    }
  ]));

  // app.on('window-all-closed', (e) => {
  //     e.preventDefault();
  //     // window.restore();
  // })

  mainWindow.loadFile("index.html");
  // mainWindow.loadURL("http://www.holmiumtechnologies.com/");
  
  mainWindow.on("closed", function() {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function(e) {
  e.preventDefault();
  // if (process.platform !== "darwin") app.quit();
});

app.on("activate", function() {
  if (mainWindow === null) createWindow();
});

// Register an event listener. When ipcRenderer sends mouse click co-ordinates, show menu at that point.
ipcMain.on(`display-app-menu`, function(e, args) {
  if (isWindows && mainWindow) {
    menu.popup({
      window: mainWindow,
      x: args.x,
      y: args.y
    });
  }
});
