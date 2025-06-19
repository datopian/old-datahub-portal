import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/" className={styles.brand}>DataHub</Link>
        <nav className={styles.nav}>
          <Link href="/datasets">Datasets</Link>
          <Link href="/organizations">Organizations</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
      <div className={styles.right}>
        <span className={styles.powered}>Powered by PortalJS and CKAN</span>
      </div>
    </header>
  );
}
