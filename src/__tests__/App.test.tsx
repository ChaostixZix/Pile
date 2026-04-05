import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from '../renderer/App';

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

Object.defineProperty(window, 'electron', {
  writable: true,
  value: {
    isMac: false,
    isWindows: false,
    pathSeparator: '/',
    joinPath: (...args: string[]) => args.join('/'),
    openFolder: jest.fn(),
    existsSync: jest.fn(() => true),
    readDir: jest.fn(),
    isDirEmpty: jest.fn(),
    readFile: jest.fn((_, callback) => callback(null, '[]')),
    deleteFile: jest.fn((_, callback) => callback(null)),
    writeFile: jest.fn((_, __, callback) => callback(null)),
    mkdir: jest.fn(() => Promise.resolve()),
    settingsGet: jest.fn(() => Promise.resolve(undefined)),
    settingsSet: jest.fn(() => Promise.resolve()),
    settingsUnset: jest.fn(() => Promise.resolve()),
    getConfigPath: jest.fn(() => '/tmp/piles.json'),
    ipc: {
      sendMessage: jest.fn(),
      on: jest.fn(() => jest.fn()),
      once: jest.fn(),
      invoke: jest.fn((channel) => {
        switch (channel) {
          case 'get-ai-key':
            return Promise.resolve(null);
          case 'index-load':
          case 'index-get':
            return Promise.resolve([]);
          case 'index-search':
          case 'index-vector-search':
          case 'index-get-threads-as-text':
            return Promise.resolve([]);
          case 'highlights-get':
          case 'tags-get':
            return Promise.resolve([]);
          case 'get-files':
            return Promise.resolve([]);
          default:
            return Promise.resolve(null);
        }
      }),
      removeAllListeners: jest.fn(),
      removeListener: jest.fn(),
    },
  },
});

describe('App', () => {
  it('should render', () => {
    expect(
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>,
      ),
    ).toBeTruthy();
  });
});
