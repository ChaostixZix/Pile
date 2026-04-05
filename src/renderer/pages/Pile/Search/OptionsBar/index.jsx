/* eslint-disable react/prop-types */
import * as Switch from '@radix-ui/react-switch';
import { PaperclipIcon, HighlightIcon, RelevantIcon } from 'renderer/icons';
import styles from './OptionsBar.module.scss';

export default function OptionsBar({ options, setOptions }) {
  const flipValue = (event) => {
    const { name } = event.currentTarget;
    setOptions((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleRecent = (event) => {
    const { name } = event.currentTarget;
    setOptions((prev) => ({ ...prev, sortOrder: name }));
  };

  const toggleSearchMode = () => {
    setOptions((prev) => ({ ...prev, semanticSearch: !prev.semanticSearch }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <button
          type="button"
          className={`${styles.button} ${
            options.sortOrder === 'relevance' && styles.active
          }`}
          name="relevance"
          onClick={toggleRecent}
        >
          <RelevantIcon className={styles.icon} /> Relevance
        </button>
        <button
          type="button"
          className={`${styles.button} ${
            options.sortOrder === 'mostRecent' && styles.active
          }`}
          name="mostRecent"
          onClick={toggleRecent}
        >
          ↑ Recent
        </button>
        <button
          type="button"
          className={`${styles.button} ${
            options.sortOrder === 'oldest' && styles.active
          }`}
          name="oldest"
          onClick={toggleRecent}
        >
          ↓ Oldest
        </button>
        <div className={styles.sep}>•</div>
        <button
          type="button"
          className={`${styles.button} ${
            options.onlyHighlighted && styles.active
          }`}
          name="onlyHighlighted"
          onClick={flipValue}
        >
          <HighlightIcon className={styles.icon} />
          Highlighted
        </button>
        <button
          type="button"
          className={`${styles.button} ${
            options.hasAttachments && styles.active
          }`}
          name="hasAttachments"
          onClick={flipValue}
        >
          <PaperclipIcon className={styles.icon} /> Attachments
        </button>
      </div>
      <div className={styles.right}>
        <div className={styles.switch}>
          <div id="semantic-search-label" className={styles.Label}>
            Semantic
          </div>
          <Switch.Root
            id="semantic-search"
            aria-labelledby="semantic-search-label"
            className={styles.SwitchRoot}
            checked={options.semanticSearch}
            onCheckedChange={toggleSearchMode}
          >
            <Switch.Thumb className={styles.SwitchThumb} />
          </Switch.Root>
        </div>
      </div>
    </div>
  );
}
