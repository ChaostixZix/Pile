// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent, shell } from 'electron';
import fs from 'fs';
import path from 'path';

export type Channels = string;

const electronHandler = {
  ipc: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke: ipcRenderer.invoke,
    removeAllListeners(channel: Channels) {
      ipcRenderer.removeAllListeners(channel);
    },
    removeListener(channel: Channels, func: any) {
      ipcRenderer.removeListener(channel, func);
    },
  },
  setupPilesFolder: (folderPath: string) => {
    fs.existsSync(folderPath);
  },
  getConfigPath: () => {
    return ipcRenderer.sendSync('get-config-file-path');
  },
  openFolder: (folderPath: string) => {
    if (folderPath.startsWith('/')) {
      shell.openPath(folderPath);
    }
  },
  existsSync: (targetPath: string) => fs.existsSync(targetPath),
  readDir: (targetPath: string, callback: any) =>
    fs.readdir(targetPath, callback),
  isDirEmpty: (targetPath: string) =>
    fs.readdir(targetPath, (err, files) => {
      if (err) throw err;
      if (files.length === 0) {
        return true;
      }
      return false;
    }),
  readFile: (targetPath: string, callback: any) =>
    fs.readFile(targetPath, 'utf-8', callback),
  deleteFile: (targetPath: string, callback: any) =>
    fs.unlink(targetPath, callback),
  writeFile: (targetPath: string, data: any, callback: any) =>
    fs.writeFile(targetPath, data, 'utf-8', callback),
  mkdir: (targetPath: string) =>
    fs.promises.mkdir(targetPath, {
      recursive: true,
    }),
  joinPath: (...args: any) => path.join(...args),
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  pathSeparator: path.sep,
  settingsGet: (key: string) => ipcRenderer.invoke('electron-store-get', key),
  settingsSet: (key: string, value: string) =>
    ipcRenderer.invoke('electron-store-set', key, value),
  settingsUnset: (key: string) =>
    ipcRenderer.invoke('electron-store-unset', key),
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
