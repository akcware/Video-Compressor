import { ipcMain, dialog, shell } from "electron";
import hbjs from "handbrake-js";

var hbjsProcess = null;

ipcMain.on("chooseFilePath", async (event) => {
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
});

ipcMain.on("compressVideo", async (event, arg) => {
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
});

ipcMain.on("cancelCompressing", () => {
  hbjsProcess.cancel();
});

ipcMain.on("focusPath", (event, path) => {
  console.log(path);
  shell.showItemInFolder(path);
});
