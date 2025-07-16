import Link from 'next/link';
import Breadcrumbs from '@/components/_shared/Breadcrumbs';
import styles from '../../styles/OrganizationPage.module.css';

function OrganizationLayout({
  organization,
  tags = [],
  formats = [],
  licenses = [],
  showAllTags = false,
  setShowAllTags = () => {},
  showAllFormats = false,
  setShowAllFormats = () => {},
  showAllLicenses = false,
  setShowAllLicenses = () => {},
  activeTag = null,
  setActiveTag = () => {},
  activeFormat = null,
  setActiveFormat = () => {},
  activeLicense = null,
  setActiveLicense = () => {},
  updateQueryParam = () => {},
  filterBtn = () => null,
  isActive = () => false,
  showFullDescription = false,
  setShowFullDescription = () => {},
  activeTab = 'datasets',
  children
}) {
  const orgName = organization.name;
  return (
    <div className={styles.pageBg}>
      <div style={{ margin: '-22px 0 12px 0' }}>
        <Breadcrumbs items={[
          { label: 'Organizations', href: '/organization' },
          { label: organization.title }
        ]} />
        <div style={{ borderBottom: '1px solid #e5e7eb', marginTop: 12 }} />
      </div>
      <div className={styles.pageContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.orgInfo}>
            <img 
              src={organization.image_url || '/images/logos/DefaultOrgLogo.svg'} 
              alt={organization.title}
              className={styles.orgLogo}
            />
            <h2 className={styles.orgTitle}>{organization.title}</h2>
            <div className={styles.orgDescWrap}>
              <p className={styles.orgDesc + (showFullDescription ? ' ' + styles.showFull : '')}>
                {organization.description || 'No description available.'}
              </p>
              {organization.description && organization.description.length > 100 && (
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className={styles.readMoreBtn}
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
            <div className={styles.orgStatsRow}>
              <div>
                <div className={styles.orgStatNum}>{organization.num_followers || 0}</div>
                <div>Followers</div>
              </div>
              <div>
                <div className={styles.orgStatNum}>{organization.package_count || 0}</div>
                <div>Datasets</div>
              </div>
            </div>
          </div>
          <div className={styles.currentOrgFilter}>
            <h3 className={styles.filterTitle}>Current Organization</h3>
            <div className={styles.currentOrgName}>{organization.title}</div>
          </div>
          <div className={styles.filterBlock}>
            <h3 className={styles.filterTitle}>Tags</h3>
            <div>
              {(showAllTags ? tags : tags.slice(0, 10)).map(tag => 
                filterBtn(tag.name, isActive(activeTag, tag.name), () => {
                  const newValue = activeTag === tag.name ? null : tag.name;
                  setActiveTag(newValue);
                  updateQueryParam('tags', newValue);
                }, tag.count)
              )}
              {tags.length > 10 && (
                <button onClick={() => setShowAllTags(v => !v)} className={styles.showMoreBtn}>
                  {showAllTags ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
          <div className={styles.filterBlock}>
            <h3 className={styles.filterTitle}>Formats</h3>
            <div>
              {(showAllFormats ? formats : formats.slice(0, 10)).map(fmt => 
                filterBtn(fmt.name.toUpperCase(), isActive(activeFormat, fmt.name.toUpperCase()), () => {
                  const newValue = activeFormat === fmt.name.toUpperCase() ? null : fmt.name.toUpperCase();
                  setActiveFormat(newValue);
                  updateQueryParam('res_format', newValue);
                }, fmt.count)
              )}
              {formats.length > 10 && (
                <button onClick={() => setShowAllFormats(v => !v)} className={styles.showMoreBtn}>
                  {showAllFormats ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
          <div className={styles.filterBlock}>
            <h3 className={styles.filterTitle}>Licenses</h3>
            <div>
              {(showAllLicenses ? licenses : licenses.slice(0, 10)).map(lic => 
                filterBtn(lic.name, isActive(activeLicense, lic.name), () => {
                  const newValue = activeLicense === lic.name ? null : lic.name;
                  setActiveLicense(newValue);
                  updateQueryParam('license_id', newValue);
                }, lic.count)
              )}
              {licenses.length > 10 && (
                <button onClick={() => setShowAllLicenses(v => !v)} className={styles.showMoreBtn}>
                  {showAllLicenses ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        </aside>
        <main className={styles.mainContent}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 24, marginTop: 8 }}>
            <Link href={`/organization/${orgName}`} legacyBehavior>
              <a style={{
                padding: '12px 24px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'datasets' ? '3px solid #ff5722' : '3px solid transparent',
                color: activeTab === 'datasets' ? '#ff5722' : '#666',
                fontWeight: activeTab === 'datasets' ? 'bold' : 'normal',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginRight: 8
              }}>Datasets</a>
            </Link>
            <Link href={`/organization/activity/${orgName}/0`} legacyBehavior>
              <a style={{
                padding: '12px 24px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'activity' ? '3px solid #ff5722' : '3px solid transparent',
                color: activeTab === 'activity' ? '#ff5722' : '#666',
                fontWeight: activeTab === 'activity' ? 'bold' : 'normal',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginRight: 8
              }}>Activity Stream</a>
            </Link>
            <Link href={`/organization/about/${orgName}`} legacyBehavior>
              <a style={{
                padding: '12px 24px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'about' ? '3px solid #ff5722' : '3px solid transparent',
                color: activeTab === 'about' ? '#ff5722' : '#666',
                fontWeight: activeTab === 'about' ? 'bold' : 'normal',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginRight: 8
              }}>About</a>
            </Link>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export default OrganizationLayout; 