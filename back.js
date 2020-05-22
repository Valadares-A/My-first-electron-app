const { ipcRenderer } = require("electron");
// por algum motivo os import que seriam feitos na view dos javascript das libs tem que ser feitos aqui
const $ = require('jquery');
const popper = require('popper.js');
const bootstrap = require('bootstrap');
// import * as $ from "jquery"; -> not work
// import popper from "popper.js"; -> not work
// import bootstrap from "bootstrap"; -> not work
// 
// import { credentials } from "./credentials"; -> not work
const credentials = require('./credentials')
const saver = require("instagram-save");
const Instagram = require("instagram-nodejs-without-api");
const inst = new Instagram();
// ######### Insta
let auxstr = "";
let idx = 0;
let timeout = 30000;
let total = 0;
let paused = false;
// let folder = "";


const btn = document.getElementById("notBtn");
const inp = document.getElementById("inp");
const folder = document.getElementById("folder");
const inputfolder = document.getElementById("iptFolder");
const links = document.getElementById("links");
const downloadBtn = document.getElementById("download");
const pauseBtn = document.getElementById("pause");
const continueBtn = document.getElementById("continue");
const btnTeste1 = document.getElementById("t1");
const btnTeste2 = document.getElementById("t2");



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
}).on("login",(event,data)=>{
  $('.toast').toast('show');
}).on("update-percent", (event,data)=>{
  $("#download-bar").attr("aria-valuenow", `${data.percentage}`);
  $("#download-bar").css("width", `${data.percentage}%`);
  $("#toshow").attr("value",data.idx);
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
  downloadBtn.setAttribute("disabled","true")
  pauseBtn.removeAttribute("disabled");
}

function onPause() {
  ipcRenderer.send("pause", {
    name: folderName,
    path: folderPath,
    links: links.value,
    index: 0,
  });
  pauseBtn.setAttribute("disabled","true")
}

function onContinue() {
  ipcRenderer.send("continue", {
    name: folderName,
    path: folderPath,
    links: links.value,
    index: 0,
  });
  pauseBtn.removeAttribute("disabled");
  continueBtn.setAttribute("disabled","true");
}

function enable1Disable2() {
  btnTeste1.removeAttribute("disabled");
  btnTeste2.setAttribute("disabled","true")
}

function enable2Disable1() {
  btnTeste1.setAttribute("disabled","true");
  btnTeste2.removeAttribute("disabled");
}

// auxstr = data.links.split("\n");
//     total = auxstr.length;
//     console.log(auxstr.length);
//     inst
//       .getCsrfToken()
//       .then((csrf) => {
//         inst.csrfToken = csrf;
//       })
//       .then(() => {
//         inst.auth(credentials.userName, credentials.password).then((sessionId) => {
//           console.log("sessionid:", sessionId);
//           inst.sessionId = sessionId;
//           idx = data.index;
//           console.log(idx);
//           win.webContents.send("update-percent", calculatePercent(idx, total));
//           downloadImg(auxstr[idx], data.path);
//         });
//       })
//       .catch(console.error);


      function downloadImg(link, folderPath) {
        if (paused === false) {
          try {
            saver(link, folderPath).then(
              (res) => {
                console.log(res.url);
                inst.getMediaIdByUrl(res.url).then((res) => {
                  console.log("imgId: ", res);
                  inst.like(res).then((d) => {
                    console.log("status: ", d);
                  });
                });
                idx++;
                win.webContents.send("update-percent", calculatePercent(idx, total));
                console.log(idx);
                if (idx <= auxstr.length - 1) {
                  setTimeout(() => {
                    downloadImg(auxstr[idx], folderPath);
                  }, timeout);
                }
              },
              (err) => {
                console.log(err);
                idx++;
                win.webContents.send("update-percent", calculatePercent(idx, total));
                console.log(idx);
                if (idx <= auxstr.length - 1) {
                  setTimeout(() => {
                    downloadImg(auxstr[idx], folderPath);
                  }, timeout);
                }
              }
            );
          } catch (error) {
            console.log(error);
            idx++;
            win.webContents.send("update-percent", calculatePercent(idx, total));
            console.log(idx);
            if (idx <= auxstr.length - 1) {
              setTimeout(() => {
                downloadImg(auxstr[idx], folderPath);
              }, timeout);
            }
          }
        }
      }

      function calculatePercent(idx, total) {
        return { idx: idx, total: total, percentage: (idx * 100) / total };
      }
