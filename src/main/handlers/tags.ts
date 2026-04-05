import { ipcMain } from 'electron';
import pileTags from '../utils/pileTags';

ipcMain.handle('tags-load', (_event, pilePath) => {
  const tags = pileTags.load(pilePath);
  return tags;
});

ipcMain.handle('tags-get', () => {
  const tags = pileTags.get();
  return tags;
});

ipcMain.handle('tags-sync', (_event, filePath) => {
  pileTags.sync(filePath);
});

ipcMain.handle('tags-add', (_event, { tag, filePath }) => {
  pileTags.add(tag, filePath);
});

ipcMain.handle('tags-remove', (_event, { tag, filePath }) => {
  pileTags.remove(tag, filePath);
});
