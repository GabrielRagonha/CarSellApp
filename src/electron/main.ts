import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import getPreloadPath from "./pathResolver.js";
import { isDev } from "./util.js";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

let mainWindow: BrowserWindow | null = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  mainWindow.maximize();

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123/");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });
});

ipcMain.handle("get-templates", async () => {
  try {
    const templatesDir = path.join(app.getAppPath(), "templates");
    const files = fs.readdirSync(templatesDir);
    return files.filter((file) => file.endsWith(".docx"));
  } catch (error: any) {
    console.error("Error reading templates:", error);
    return [];
  }
});

ipcMain.handle("read-template", async (_, templateName) => {
  try {
    const templatePath = path.join(
      app.getAppPath(),
      "templates",
      templateName
    );
    return fs.readFileSync(templatePath);
  } catch (error: any) {
    console.error("Error reading template:", error);
    throw error;
  }
});

ipcMain.handle("show-save-dialog", async (_, options) => {
  if (!mainWindow) return null;

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: options.defaultPath || "contract.docx",
    filters: [{ name: "Word Documents", extensions: ["docx"] }],
    ...options,
  });

  if (canceled || !filePath) {
    return null;
  }

  return filePath;
});

ipcMain.handle("save-contract", async (_, templateName, data, outputPath) => {
  try {
    const templatesDir = path.join(app.getAppPath(), "templates");
    const templatePath = path.join(templatesDir, templateName);

    const content = fs.readFileSync(templatePath, "binary");

    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render(data);

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    fs.writeFileSync(outputPath, buffer);

    return { success: true, path: outputPath };
  } catch (error: any) {
    console.error("Error generating contract:", error);
    return { success: false, error: error.message };
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    app.on("ready", () => {});
  }
});
