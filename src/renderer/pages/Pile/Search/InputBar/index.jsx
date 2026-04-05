/* eslint-disable react/prop-types */
import * as Dialog from '@radix-ui/react-dialog';
import { CrossIcon, Search2Icon } from 'renderer/icons';
import styles from './InputBar.module.scss';
import Thinking from '../../Toasts/Toast/Loaders/Thinking';

export default function InputBar({
  value,
  onChange,
  querying = false,
  onSubmit,
}) {
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSubmit();
      event.preventDefault();
      return false;
    }

    return true;
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.bar}>
          <input
            value={value}
            onChange={onChange}
            className={styles.textarea}
            onKeyDown={handleKeyPress}
            placeholder="What are you looking for?"
          />
        </div>
        <div className={styles.buttons}>
          <button
            type="button"
            className={`${styles.ask} ${querying && styles.processing}`}
            onClick={onSubmit}
            disabled={querying}
          >
            {querying ? (
              <Thinking className={styles.spinner} />
            ) : (
              <Search2Icon className={styles.icon} />
            )}
          </button>
          <Dialog.Close asChild>
            <button
              type="button"
              className={styles.close}
              aria-label="Close search"
            >
              <CrossIcon className={styles.icon} />
            </button>
          </Dialog.Close>
        </div>
      </div>
    </div>
  );
}
