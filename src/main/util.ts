/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

const fs = require('fs');

const { readdir } = fs.promises;
const { stat } = fs.promises;

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function convertHTMLToPlainText(html: string) {
  // Replace <a> tags with the value of their href attribute
  const htmlWithLinksReplaced = html.replace(
    /<a [^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi,
    (_match, href) => {
      return href;
    },
  );

  // Strip out remaining <p>, <strong> tags
  return htmlWithLinksReplaced.replace(/<\/?p>|<\/?strong>/gi, '');
}

export async function walk(dir: string, root = true) {
  let files = await readdir(dir);
  files = await Promise.all(
    files.map(async (file: any) => {
      const filePath = path.join(dir, file);
      const stats = await stat(filePath);
      if (stats.isDirectory()) {
        // Validate by YEAR/MMM:2024/Nov folder structure
        if (
          !root &&
          !(
            /^\d{4}$/.test(file) ||
            /^[Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec]{3}$/.test(file)
          )
        ) {
          return null;
        }
        return walk(filePath, false);
      }
      if (stats.isFile() && filePath.endsWith('.md')) {
        return filePath;
      }
      return null;
    }),
  );

  return files.flat().filter(Boolean);
}
