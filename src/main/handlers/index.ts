import { ipcMain } from 'electron';
import pileIndex from '../utils/pileIndex';

ipcMain.handle('index-load', async (_event, pilePath) => {
  const index = await pileIndex.load(pilePath);
  return index;
});

ipcMain.handle('index-get', () => {
  const index = pileIndex.get();
  return index;
});

ipcMain.handle('index-regenerate-embeddings', () => {
  const index = pileIndex.regenerateEmbeddings();
  return index;
});

ipcMain.handle('index-add', (_event, filePath) => {
  const index = pileIndex.add(filePath);
  return index;
});

ipcMain.handle('index-update', (_event, filePath, data) => {
  const index = pileIndex.update(filePath, data);
  return index;
});

ipcMain.handle('index-search', (_event, query) => {
  const results = pileIndex.search(query);
  return results;
});

ipcMain.handle('index-vector-search', (_event, query, topN = 50) => {
  const results = pileIndex.vectorSearch(query, topN);
  return results;
});

ipcMain.handle('index-get-threads-as-text', (_event, filePaths = []) => {
  return filePaths.map((filePath: string) =>
    pileIndex.getThreadAsText(filePath),
  );
});

ipcMain.handle('index-remove', (_event, filePath) => {
  const index = pileIndex.remove(filePath);
  return index;
});
