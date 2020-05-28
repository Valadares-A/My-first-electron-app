const { ipcRenderer } = require("electron");
// por algum motivo os import que seriam feitos na view dos javascript das libs tem que ser feitos aqui
const $ = require("jquery");
const popper = require("popper.js");
const bootstrap = require("bootstrap");
// import * as $ from "jquery"; -> not work
// import popper from "popper.js"; -> not work
// import bootstrap from "bootstrap"; -> not work
//
// import { credentials } from "./credentials"; -> not work
const credentials = require("./credentials");
const saver = require("instagram-save");
const Instagram = require("instagram-nodejs-without-api");
const inst = new Instagram();
const btn = document.getElementById("notBtn");
const inp = document.getElementById("inp");
const folder = document.getElementById("folder");
const inputfolder = document.getElementById("iptFolder");
const links = document.getElementById("links");
const downloadBtn = document.getElementById("download");
const progressBar = document.getElementById("download-bar");
const pauseBtn = document.getElementById("pause");
const continueBtn = document.getElementById("continue");
const btnTeste1 = document.getElementById("t1");
const btnTeste2 = document.getElementById("t2");
const userNameInpt = document.getElementById("userName");
const passWordInpt = document.getElementById("passWord");
const labelProgress = document.getElementById("label-progress");

let mensage = "";
let folderName = "";
let folderPath = "";
let idx = 0;
let timeout = 20000;
let total = 0;
let paused = false;

userNameInpt.value = credentials.userName;
passWordInpt.value = credentials.passWord;

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

ipcRenderer
  .on("folder-info", (event, data) => {
    console.log("view", data);
    if (!data.canceled) {
      folderPath = data.filePaths[0];
      inputfolder.value = folderPath;
      let aux = folderPath.split("/");
      folderName = aux[aux.length - 1];
      // inputfolder.value = folderName;
      // inputfolder.focus();
      links.focus();
    }
  })
  .on("login", (event, data) => {
    // $(".toast").toast("show");
    $("#toast-done").toast("show");
  });

function changeDefaultSize() {
  ipcRenderer.send("resize-window", { width: 500, height: 300 });
}

async function download() {
  try {
    // inst
    //   .getCsrfToken()
    //   .then((csrf) => {
    //     inst.csrfToken = csrf;
    //   })
    //   .then(
    //     () => {
    //       inst
    //         .auth(credentials.userName, credentials.passWord)
    //         .then((sessionId) => {
    //           console.log("sessionid:", sessionId);
    //           inst.sessionId = sessionId;
    //           // win.webContents.send("update-percent", calculatePercent(idx, total));
    //           // downloadImg(auxstr[idx], data.path);
    //         });
    //     },
    //     (err) => {
    //       console.log(err);
    //     }
    //   );
    // .catch(console.error);
    idx = 0;
    ipcRenderer.send("download-photos", {
      name: folderName,
      path: folderPath,
      links: links.value.split("\n"),
      index: idx,
    });
    console.log(links.value.split("\n"));
    console.log(folderName);
    console.log(folderPath);
    total = links.value.split("\n").length - 1;
    downloadPromise(links.value.split("\n"));
    $("#toast-start").toast("show");
    downloadBtn.setAttribute("disabled", "true");
    pauseBtn.removeAttribute("disabled");
  } catch (error) {
    console.log(error);
  }
}

function onPause() {
  // ipcRenderer.send("pause", {
  //   name: folderName,
  //   path: folderPath,
  //   links: links.value,
  //   index: 0,
  // });
  pauseBtn.setAttribute("disabled", "true");
  continueBtn.removeAttribute("disabled");
  paused = true;
  console.log("clicquei em pausar");
  progressBar.innerHTML = "Aguarde...";
}

function onContinue() {
  // ipcRenderer.send("continue", {
  //   name: folderName,
  //   path: folderPath,
  //   links: links.value,
  //   index: 0,
  // });
  pauseBtn.removeAttribute("disabled");
  continueBtn.setAttribute("disabled", "true");
  paused = false;
  console.log("cliquei em continuar");
  progressBar.innerHTML = "Retomando...";
  console.log("download retomado");
  downloadPromise(links.value.split("\n"));
}

function enable1Disable2() {
  btnTeste1.removeAttribute("disabled");
  btnTeste2.setAttribute("disabled", "true");
  idx++;
  updateProgressBar(idx, 100);
}

function enable2Disable1() {
  btnTeste1.setAttribute("disabled", "true");
  btnTeste2.removeAttribute("disabled");
  idx++;
  updateProgressBar(idx, 100);
}

async function downloadImg(link, folderPath) {
  return await saver(link, folderPath).then(
    (res) => {
      console.log(res.url);
      // inst.getMediaIdByUrl(res.url).then((res) => {
      //   console.log("imgId: ", res);
      //   inst.like(res).then((d) => {
      //     console.log("status: ", d);
      //   });
      // });
      return true;
    },
    (err) => {
      console.log(err);
      return false;
    }
  );
}

async function downloadPromise(list) {
  for (let i = idx; i < list.length; i++) {
    idx = i;
    labelProgress.innerHTML = `${idx}/${total}`;
    if (!paused) {
      await new Promise((resolve, reject) => {
        setTimeout(async () => {
          let itsOk = await downloadImg(list[i], folderPath);
          if (itsOk) {
            resolve({ status: "ok", link: list[i], index: i });
          } else {
            reject({ status: "bad", link: list[i], index: i });
          }
        }, timeout);
      }).then(
        (res) => {
          console.log(res);
          updateProgressBar(idx, total);
        },
        (err) => {
          console.log(err);
          updateProgressBar(idx, total);
        }
      );
    } else {
      console.log("download pausado");
      progressBar.innerHTML = "Pausado...";
      progressBar.classList.add("bg-warning");
      break;
    }
  }

  if (!paused) {
    console.log("download concluido");
    $("#toast-done").toast("show");
    downloadBtn.removeAttribute("disabled");
    pauseBtn.setAttribute("disabled", "true");
    continueBtn.setAttribute("disabled", "true");
  }
}

function calculatePercent(idx, total) {
  return { idx: idx, total: total, percentage: (idx * 100) / total };
}

async function logIn() {
  console.log(userNameInpt.value);
  console.log(passWordInpt.value);
  try {
    inst
      .getCsrfToken()
      .then((csrf) => {
        inst.csrfToken = csrf;
      })
      .then(() => {
        return inst
          .auth(credentials.userName, credentials.passWord)
          .then((sessionId) => {
            console.log(sessionId);

            inst.sessionId = sessionId;

            return inst.getUserDataByUsername("emily_knight.tv").then((t) => {
              console.log(t);

              console.log(t.graphql);

              return inst.getUserFollowers(t.graphql.user.id).then((t) => {
                console.log(t); // - inst followers for user "username-for-get"
              });
            });
          });
      })
      .catch(console.error);
  } catch (error) {
    console.log(error);
  }
}

function updateProgressBar(idx, total) {
  if (progressBar.classList.contains("bg-success")) {
    progressBar.classList.remove("bg-success");
  }
  if (progressBar.classList.contains("bg-warning")) {
    progressBar.classList.remove("bg-warning");
  }
  let infos = calculatePercent(idx, total);
  progressBar.setAttribute("aria-valuemax", total.toString());
  progressBar.setAttribute("aria-valuenow", `${Math.round(infos.percentage)}`);
  progressBar.style.width = `${Math.round(infos.percentage)}%`;
  progressBar.innerHTML = `${Math.round(infos.percentage)}%`;
  if (idx === total) {
    progressBar.classList.add("bg-success");
  }
}
