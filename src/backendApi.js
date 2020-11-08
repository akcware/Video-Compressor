import { app, ipcMain, dialog, shell, Menu } from "electron";
import hbjs from "handbrake-js";
var hbjsProcess = null;

const chooseFilePath = async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [
      {
        name: "Video file",
        extensions: ["mp4", "mov", "wmv", "flv", "m4a", "m4v", "avi"],
      },
    ],
    properties: ["openFile"],
  });

  if (!canceled) {
    const path = filePaths[0];
    event.reply("filePathResponse", path);
  }
};

const compressVideo = async (event, arg) => {
  // Choose folder path to save
  const { canceled, filePath } = await dialog.showSaveDialog({
    filters: [{ name: "Video file", extensions: ["mp4", "m4v"] }],
    properties: ["createDirectory"],
  });

  if (!canceled) {
    hbjsProcess = hbjs.spawn({ input: arg, output: filePath });

    hbjsProcess
      .on("error", (err) => {
        console.error(err);
        event.reply("handbrakeError", err);
      })
      .on("progress", (progress) => {
        event.reply("handbrakeProgress", progress);
      })
      .on("end", () => {
        event.reply("handbrakeSuccessfullyCompleted", filePath);
      });
  }
};

const initializeMenu = () => {
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        { label: "Open file to compress", click: chooseFilePath },
        {
          label: "Exit",
          click() {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click() {
            dialog.showMessageBox({
              title: "About",
              message:
                "This app is written with Electron.js, vue.js and handbrake.js (handbrake cli) by Aşkın Kadir Çekim. MIT Licence",
            });
          },
        },
        {
          label: "GitHub",
          click() {
            shell.openExternal("https://github.com/akcware/Video-Compressor");
          },
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
};

ipcMain.on("chooseFilePath", chooseFilePath);
ipcMain.on("compressVideo", compressVideo);

ipcMain.on("cancelCompressing", () => hbjsProcess.cancel);

ipcMain.on("focusPath", (event, path) => {
  console.log(path);
  shell.showItemInFolder(path);
});

initializeMenu();
