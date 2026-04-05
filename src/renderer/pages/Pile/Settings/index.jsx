import { SettingsIcon, CrossIcon } from 'renderer/icons';
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAIContext } from 'renderer/context/AIContext';
import {
  availableThemes,
  usePilesContext,
} from 'renderer/context/PilesContext';
import styles from './Settings.module.scss';
import AISettingTabs from './AISettingsTabs';

export default function Settings() {
  const { prompt, setPrompt, updateSettings, getKey, setKey, deleteKey } =
    useAIContext();
  const [APIkey, setCurrentKey] = useState('');
  const { currentTheme, setTheme } = usePilesContext();

  useEffect(() => {
    const retrieveKey = async () => {
      const key = await getKey();
      setCurrentKey(key);
    };

    retrieveKey();
  }, [getKey]);

  const handleOnChangePrompt = (e) => {
    const p = e.target.value ?? '';
    setPrompt(p);
  };

  const handleSaveChanges = () => {
    if (!APIkey || APIkey === '') {
      deleteKey();
    } else {
      setKey(APIkey);
    }

    updateSettings(prompt);
    // regenerateEmbeddings();
  };

  const renderThemes = () => {
    return Object.keys(availableThemes).map((theme) => {
      const colors = availableThemes[theme];
      return (
        <button
          key={`theme-${theme}`}
          type="button"
          aria-label={`Use ${theme} theme`}
          className={`${styles.theme} ${
            currentTheme === theme ? styles.current : ''
          }`}
          onClick={() => {
            setTheme(theme);
          }}
        >
          <div
            className={styles.color1}
            style={{ background: colors.primary }}
          />
        </button>
      );
    });
  };
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div className={styles.iconHolder}>
          <SettingsIcon className={styles.settingsIcon} />
        </div>
      </Dialog.Trigger>
      <Dialog.Portal container={document.getElementById('dialog')}>
        <Dialog.Overlay className={styles.DialogOverlay} />
        <Dialog.Content className={styles.DialogContent}>
          <Dialog.Title className={styles.DialogTitle}>Settings</Dialog.Title>
          <fieldset className={styles.Fieldset}>
            <legend className={styles.Label}>Appearance</legend>
            <div className={styles.themes}>{renderThemes()}</div>
          </fieldset>

          <fieldset className={styles.Fieldset}>
            <legend className={styles.Label}>AI configuration</legend>
            <AISettingTabs APIkey={APIkey} setCurrentKey={setCurrentKey} />
          </fieldset>

          <fieldset className={styles.Fieldset}>
            <label className={styles.Label} htmlFor="ai-personality-prompt">
              AI personality prompt
              <textarea
                id="ai-personality-prompt"
                className={styles.Textarea}
                placeholder="Enter your own prompt for AI reflections"
                value={prompt}
                onChange={handleOnChangePrompt}
              />
            </label>
          </fieldset>
          <div
            style={{
              display: 'flex',
              marginTop: 25,
              justifyContent: 'flex-end',
            }}
          >
            <Dialog.Close asChild>
              <button
                type="button"
                className={styles.Button}
                onClick={handleSaveChanges}
              >
                Save changes
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button
              type="button"
              className={styles.IconButton}
              aria-label="Close"
            >
              <CrossIcon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
