/* eslint react/prop-types: 0 */
import {
  useState,
  createContext,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { useToastsContext } from './ToastsContext';

export const AutoUpdateContext = createContext();

export function AutoUpdateContextProvider({ children }) {
  const { addNotification, removeNotification } = useToastsContext();

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateNotAvailable, setUpdateNotAvailable] = useState(false);

  const handleUpdateAvailable = useCallback(() => {
    addNotification({
      id: 'auto-update',
      message: 'Update available',
      dismissTime: 2000,
    });

    addNotification({
      id: 'auto-update',
      type: 'waiting',
      message: 'Downloading update...',
      dismissTime: 5000,
    });

    setUpdateAvailable(true);
  }, [addNotification]);

  const handleUpdateDownloaded = useCallback(() => {
    removeNotification('auto-update');
    setUpdateDownloaded(true);
  }, [removeNotification]);

  const handleUpdateError = useCallback(
    (error) => {
      addNotification({
        id: 'auto-update',
        type: 'failed',
        message: 'Auto update failed',
        dismissTime: 5000,
      });

      setUpdateError(error);
    },
    [addNotification],
  );

  const handleUpdateNotAvailable = useCallback(() => {
    addNotification({
      id: 'auto-update',
      message: 'Pile is up-to-date',
      type: 'success',
      dismissTime: 5000,
      immediate: false,
    });

    setUpdateNotAvailable(true);
  }, [addNotification]);

  useEffect(() => {
    if (!window) {
      return undefined;
    }

    window.electron.ipc.on('update_available', handleUpdateAvailable);
    window.electron.ipc.on('update_downloaded', handleUpdateDownloaded);
    window.electron.ipc.on('update_error', handleUpdateError);
    window.electron.ipc.on('update_not_available', handleUpdateNotAvailable);

    return () => {
      window.electron.ipc.removeListener(
        'update_available',
        handleUpdateAvailable,
      );
      window.electron.ipc.removeListener(
        'update_downloaded',
        handleUpdateDownloaded,
      );
      window.electron.ipc.removeListener('update_error', handleUpdateError);
      window.electron.ipc.removeListener(
        'update_not_available',
        handleUpdateNotAvailable,
      );
    };
  }, [
    handleUpdateAvailable,
    handleUpdateDownloaded,
    handleUpdateError,
    handleUpdateNotAvailable,
  ]);

  const restartAndUpdate = useCallback(() => {
    if (!window) return;
    window.electron.ipc.sendMessage('restart_app');
  }, []);

  const autoUpdateContextValue = useMemo(
    () => ({
      updateAvailable,
      updateDownloaded,
      updateError,
      updateNotAvailable,
      restartAndUpdate,
    }),
    [
      updateAvailable,
      updateDownloaded,
      updateError,
      updateNotAvailable,
      restartAndUpdate,
    ],
  );

  return (
    <AutoUpdateContext.Provider value={autoUpdateContextValue}>
      {children}
    </AutoUpdateContext.Provider>
  );
}

export const useAutoUpdateContext = () => useContext(AutoUpdateContext);
