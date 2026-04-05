import { useToastsContext } from 'renderer/context/ToastsContext';
import { AnimatePresence } from 'framer-motion';
import Toast from './Toast';
import styles from './Toasts.module.scss';

export default function Toasts() {
  const { notifications } = useToastsContext();

  const renderNotifications = () => {
    if (notifications.length === 0) return null;

    return notifications
      .filter((_, index) => index === 0)
      .map((notification) => (
        <Toast key={notification.id} notification={notification} />
      ));
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">{renderNotifications()}</AnimatePresence>
    </div>
  );
}
