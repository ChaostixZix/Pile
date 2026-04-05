import styles from './Sidebar.module.scss';
import Timeline from './Timeline';

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <Timeline />
    </div>
  );
}
