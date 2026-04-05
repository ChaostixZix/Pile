/* eslint react/prop-types: 0 */
import {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { usePilesContext } from './PilesContext';

export const IndexContext = createContext();

export function IndexContextProvider({ children }) {
  const { currentPile, getCurrentPilePath } = usePilesContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const [index, setIndex] = useState(new Map());
  const [latestThreads, setLatestThreads] = useState([]);

  const loadIndex = useCallback(async (pilePath) => {
    const newIndex = await window.electron.ipc.invoke('index-load', pilePath);
    const newMap = new Map(newIndex);
    setIndex(newMap);
  }, []);

  const refreshIndex = useCallback(async () => {
    const nextIndex = await window.electron.ipc.invoke('index-get');
    setIndex(new Map(nextIndex));
  }, []);

  const getThreadsAsText = useCallback(async (filePaths) => {
    return window.electron.ipc.invoke('index-get-threads-as-text', filePaths);
  }, []);

  const search = useCallback(async (query) => {
    return window.electron.ipc.invoke('index-search', query);
  }, []);

  const loadLatestThreads = useCallback(
    async (count = 25) => {
      const items = await search('');
      const latest = items.slice(0, count);

      const entryFilePaths = latest.map((entry) => entry.ref);
      const latestThreadsAsText = await getThreadsAsText(entryFilePaths);

      setLatestThreads(latestThreadsAsText);
    },
    [getThreadsAsText, search],
  );

  useEffect(() => {
    if (!currentPile) {
      return;
    }

    loadIndex(getCurrentPilePath());
    loadLatestThreads();
  }, [currentPile, getCurrentPilePath, loadIndex, loadLatestThreads]);

  const prependIndex = useCallback((key, value) => {
    setIndex((prevIndex) => {
      const newIndex = new Map([[key, value], ...prevIndex]);
      return newIndex;
    });
  }, []);

  const addIndex = useCallback(
    async (newEntryPath) => {
      await window.electron.ipc.invoke('index-add', newEntryPath);
      await loadLatestThreads();
    },
    [loadLatestThreads],
  );

  const regenerateEmbeddings = useCallback(() => {
    window.electron.ipc.invoke('index-regenerate-embeddings');
  }, []);

  const updateIndex = useCallback(
    async (filePath, data) => {
      const nextIndex = await window.electron.ipc.invoke(
        'index-update',
        filePath,
        data,
      );
      setIndex(new Map(nextIndex));
      await loadLatestThreads();
    },
    [loadLatestThreads],
  );

  const removeIndex = useCallback(async (filePath) => {
    const nextIndex = await window.electron.ipc.invoke(
      'index-remove',
      filePath,
    );
    setIndex(new Map(nextIndex));
  }, []);

  const vectorSearch = useCallback(async (query, topN = 50) => {
    return window.electron.ipc.invoke('index-vector-search', query, topN);
  }, []);

  const indexContextValue = useMemo(
    () => ({
      index,
      refreshIndex,
      addIndex,
      removeIndex,
      updateIndex,
      search,
      searchOpen,
      setSearchOpen,
      vectorSearch,
      getThreadsAsText,
      latestThreads,
      regenerateEmbeddings,
      prependIndex,
    }),
    [
      index,
      refreshIndex,
      addIndex,
      removeIndex,
      updateIndex,
      search,
      searchOpen,
      setSearchOpen,
      vectorSearch,
      getThreadsAsText,
      latestThreads,
      regenerateEmbeddings,
      prependIndex,
    ],
  );

  return (
    <IndexContext.Provider value={indexContextValue}>
      {children}
    </IndexContext.Provider>
  );
}

export const useIndexContext = () => useContext(IndexContext);
