import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        <div>
          <h4>Explore</h4>
          <Link href="/datasets">Datasets</Link>
          <Link href="/organizations">Organizations</Link>
          <Link href="/about">About</Link>
          <Link href="/api">API Docs</Link>
        </div>
        <div>
          <h4>PortalJS</h4>
          <Link href="https://portaljs.org">PortalJS and CKAN</Link>
          <Link href="https://portaljs.org/cloud">PortalJS Cloud</Link>
        </div>
      </div>
      <div className={styles.powered}>
        <span>🍴 Powered by PortalJS and CKAN</span>
      </div>
    </footer>
  );
}
