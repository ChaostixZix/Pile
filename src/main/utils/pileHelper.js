const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { ipcMain } = require('electron');

const updateFile = (filePath, content) => {
  fs.writeFile(filePath, content, (err) => {
    if (err) throw err;
  });
};

const getMarkdownFiles = (directory) => {
  return new Promise((resolve, reject) => {
    glob(path.join(directory, '**', '*.md'), (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
};

const getFile = (filePath) => fs.promises.readFile(filePath, 'utf-8');

class PileHelper {
  constructor() {
    this.watcher = null;
    this.updateFile = updateFile;
    this.getMarkdownFiles = getMarkdownFiles;
    this.getFile = getFile;
  }

  watchFolder = (watchPath) => {
    if (!watchPath) return;
    this.watcher = fs.watch(
      watchPath,
      { recursive: true },
      (eventType, filename) => {
        // When a file changes, emit a message with the file's name and the event type
        ipcMain.emit('file-updated', { eventType, filename });
      },
    );
  };

  changeWatchFolder(newPath) {
    if (this.watcher) {
      this.watcher.close();
    }

    this.watchFolder(newPath);
  }

  async getFilesInFolder(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const files = entries
      .filter((file) => !file.isDirectory())
      .map((file) => path.join(dirPath, file.name));
    const folders = entries.filter((folder) => folder.isDirectory());
    const nestedFiles = await Promise.all(
      folders.map((folder) =>
        this.getFilesInFolder(path.join(dirPath, folder.name)),
      ),
    );

    return files.concat(...nestedFiles);
  }
}

module.exports = new PileHelper();
