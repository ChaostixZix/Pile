import { ipcMain } from 'electron';
import settings from 'electron-settings';

ipcMain.handle('electron-store-get', async (_event, key) => {
  return settings.get(key);
});

ipcMain.handle('electron-store-set', async (_event, key, value) => {
  await settings.set(key, value);
  return null;
});

ipcMain.handle('electron-store-unset', async (_event, key) => {
  await settings.unset(key);
  return null;
});
