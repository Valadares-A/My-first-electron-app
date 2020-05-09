const {
  app,
  BrowserWindow,
  Notification,
  Menu,
  Tray,
  webContents,
  ipcMain,
} = require("electron");

let myNotification;
// let notButton;
let tray = null;

function createWindow() {
  // Cria uma janela de navegação.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  win.loadFile("index.html");

  // Open the DevTools.
  win.webContents.openDevTools();
//   console.log(win.webContents);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Algumas APIs podem ser usadas somente depois que este evento ocorre.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // No macOS é comum para aplicativos e sua barra de menu
  // permaneçam ativo até que o usuário explicitamente encerre com Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("ready", (event) => {
    tray = new Tray("icon2.png");
    const contextMenu = Menu.buildFromTemplate([
      { label: "Item1", type: "radio" },
      { label: "Item2", type: "radio" },
      { label: "Item3", type: "radio", checked: true },
      { label: "Item4", type: "radio" },
    ]);
    tray.setContextMenu(contextMenu);
    contextMenu.items[1].checked = false;
    tray.setToolTip("This is my application.");
    tray.setContextMenu(contextMenu);
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. Você também pode colocar eles em arquivos separados e requeridos-as aqui.
ipcMain
  .on("x", (event, data) => {
    console.log("data from main: ", data);
  })
  .on("y", (event, data) => {
    console.log("data from main: ", data);
  })
  .on("notify", (event, data) => {
    myNotification = new Notification({
      title: "Hey!",
      subtitle: "let's go boy",
      body: data,
    });
    myNotification.show();
    // myNotification.on("click", (ev)=>{
    //     console.log(ev);

    // })
    myNotification.on("close", (ev) => {
      console.log(ev);
    });
  });
