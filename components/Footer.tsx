import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        <div>
          <div className={styles.linksTitle}>Explore</div>
          <Link href="/dataset">Datasets</Link>
          <Link href="/organization">Organizations</Link>
          <Link href="/about">About</Link>
          <Link href="https://docs.ckan.org/en/2.6/api/">API Docs</Link>
        </div>
        <div>
          <div className={styles.linksTitle}>PortalJS</div>
          <Link href="https://portaljs.com/ckan">PortalJS and CKAN</Link>
          <Link href="https://portaljs.com">PortalJS Cloud</Link>
        </div>
      </div>
      <div className={styles.powered}>
        <span>
          Powered by <a href="https://portaljs.com/ckan" target="_blank" rel="noopener noreferrer" style={{ color: '#ff5722', textDecoration: 'underline' }}>PortalJS and CKAN</a>
        </span>
      </div>
    </footer>
  );
}
