import Link from 'next/link';
import styles from './Header.module.css';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/" className={styles.brand}>DataHub</Link>
        <button
          className={styles.hamburger}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={styles.nav + (menuOpen ? ' ' + styles.open : '')}>
          <Link href="/dataset" onClick={() => setMenuOpen(false)}>Datasets</Link>
          <Link href="/organization" onClick={() => setMenuOpen(false)}>Organizations</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
        </nav>
      </div>
      <div className={styles.right}>
        <span className={styles.powered}>
          Powered by <a href="https://portaljs.com/ckan" target="_blank" rel="noopener noreferrer" style={{ color: '#ff5722', textDecoration: 'underline' }}>PortalJS and CKAN</a>
        </span>
      </div>
    </header>
  );
}
