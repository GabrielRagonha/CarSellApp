const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  saveContract: (templatePath: any, data: any, outputPath: any) =>
    ipcRenderer.invoke("save-contract", templatePath, data, outputPath),

  getTemplates: () => ipcRenderer.invoke("get-templates"),

  showSaveDialog: (options: any) =>
    ipcRenderer.invoke("show-save-dialog", options),

  readTemplate: (templateName: any) =>
    ipcRenderer.invoke("read-template", templateName),
});
