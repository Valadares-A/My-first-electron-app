const {
  app,
  BrowserWindow,
  Notification,
  Menu,
  Tray,
  ipcMain,
  dialog,
} = require("electron");
const Store = require("./Store");
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: "user-preferences",
  defaults: {
    // 800x600 is the default size of our window
    windowBounds: { width: 800, height: 600 },
    pages: {},
  },
});

// ######### System
let myNotification;
let tray = null;
let win;

function createWindow() {
  // Cria uma janela de navegação.
  win = new BrowserWindow({
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
  // win.webContents.executeJavaScript()
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
  // tray = new Tray("icon2.png");
  // const contextMenu = Menu.buildFromTemplate([
  //   { label: "Item1", type: "radio" },
  //   { label: "Item2", type: "radio" },
  //   { label: "Item3", type: "radio", checked: true },
  //   { label: "Item4", type: "radio" },
  // ]);
  // tray.setContextMenu(contextMenu);
  // contextMenu.items[1].checked = false;
  // tray.setToolTip("This is my application.");
  // tray.setContextMenu(contextMenu);
  console.log("path: ", app.getAppPath());
  console.log(store.get("windowBounds"));
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
    myNotification.on("close", (ev) => {
      console.log(ev);
    });
    console.log("sending log in event");

    win.webContents.send("login", { status: "ok" });
  })
  .on("chooseFolder", (event, data) => {
    dialog
      .showOpenDialog({
        title: "Selecione uma pasta",
        properties: ["openDirectory", "createDirectory"],
      })
      .then((res) => {
        console.log(res);
        win.webContents.send("folder-info", res);
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .on("resize-window", (even, data) => {
    console.log("mudand a conf da tela");
    console.log(data);
    let width = data.width;
    let height = data.height;
    store.set("windowBounds", { width, height });
  })
  .on("download-photos", (event, data) => {
    console.log("download event started");
    
    let aux = {};
    let aux2 = store.get("pages") ? store.get("pages"): {};
    aux[data.name] = data;
    store.set("pages", { ...aux2, ...aux });
  });
