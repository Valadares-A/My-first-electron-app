const { ipcRenderer } = require("electron");
let btn = document.getElementById("notBtn");
let inp = document.getElementById("inp");
let folder = document.getElementById("folder");
let inputfolder = document.getElementById("iptFolder");
let links = document.getElementById("links");
let mensage = "";
let folderName = "";
let folderPath = "";

inp.addEventListener("keydown", (event) => {
  console.log(event.target.value);
  mensage = event.target.value;
});

folder.addEventListener("click", (event) => {
  console.log("Botão de folder: ", event);
  ipcRenderer.send("chooseFolder", event);
});

btn.addEventListener("click", (event) => {
  console.log(event);
  ipcRenderer.send("x", { name: "x", value: event.x });
  ipcRenderer.send("y", { name: "y", value: event.y });
  ipcRenderer.send("notify", inp.value);
});

ipcRenderer.on("folder-info", (event, data) => {
  console.log("view", data);
  if (!data.canceled) {
    folderPath = data.filePaths[0];
    inputfolder.value = folderPath;
    let aux = folderPath.split("/");
    folderName = aux[aux.length - 1];
    // inputfolder.value = folderName;
    inputfolder.focus();
  }
});

function changeDefaultSize() {
  ipcRenderer.send("resize-window", { width: 500, height: 300 });
}

function download() {
  ipcRenderer.send("download-photos", {
    name: folderName,
    path: folderPath,
    links: links.value,
    index: 0,
  });
}
