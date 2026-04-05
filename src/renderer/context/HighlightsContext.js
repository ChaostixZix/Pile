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

export const HighlightsContext = createContext();

export function HighlightsContextProvider({ children }) {
  const { currentPile, getCurrentPilePath } = usePilesContext();
  const [open, setOpen] = useState(false);
  const [highlights, setHighlights] = useState(new Map());

  const openHighlights = useCallback(() => {
    setOpen(true);
  }, []);

  const onOpenChange = useCallback((nextOpen) => {
    setOpen(nextOpen);
  }, []);

  const loadHighlights = useCallback(async (pilePath) => {
    const nextHighlights = await window.electron.ipc.invoke(
      'highlights-load',
      pilePath,
    );
    setHighlights(new Map(nextHighlights));
  }, []);

  useEffect(() => {
    if (!currentPile) {
      return;
    }

    loadHighlights(getCurrentPilePath());
  }, [currentPile, getCurrentPilePath, loadHighlights]);

  const refreshHighlights = useCallback(async () => {
    const nextHighlights = await window.electron.ipc.invoke('highlights-get');
    setHighlights(new Map(nextHighlights));
  }, []);

  const createHighlight = useCallback(
    async (highlight) => {
      await window.electron.ipc.invoke('highlights-create', highlight);
      await refreshHighlights();
    },
    [refreshHighlights],
  );

  const deleteHighlight = useCallback(
    async (highlight) => {
      await window.electron.ipc.invoke('highlights-delete', highlight);
      await refreshHighlights();
    },
    [refreshHighlights],
  );

  const highlightsContextValue = useMemo(
    () => ({
      open,
      openHighlights,
      onOpenChange,
      highlights,
      refreshHighlights,
      createHighlight,
      deleteHighlight,
    }),
    [
      open,
      openHighlights,
      onOpenChange,
      highlights,
      refreshHighlights,
      createHighlight,
      deleteHighlight,
    ],
  );

  return (
    <HighlightsContext.Provider value={highlightsContextValue}>
      {children}
    </HighlightsContext.Provider>
  );
}

export const useHighlightsContext = () => useContext(HighlightsContext);
