import fs from 'fs';
import path from 'path';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useState, useMemo, useEffect } from 'react';
import lunr from 'lunr';
import Link from 'next/link';
import Tabs from '@/components/_shared/Tabs';
import styles from '../../styles/OrganizationPage.module.css';
import { useRouter } from 'next/router';
import Breadcrumbs from '@/components/_shared/Breadcrumbs';

interface Organization {
  id: string;
  name: string;
  title: string;
  description: string;
  image_url?: string;
  created?: string;
  num_followers?: number;
  package_count?: number;
  packages?: any[];
  users?: any[];
  groups?: any[];
  extras?: any[];
  tags?: any[];
}

interface DatasetIndexEntry {
  id: string;
  title: string;
  description: string;
  organization: string;
  tags: string[];
  path: string;
  formats?: string[];
  licenses?: string[];
  created?: string | null;
  modified?: string | null;
}

interface ActivityStreamEntry {
  user_id: string;
  timestamp: string;
  object_id: string;
  revision_id: string;
  data: any;
  id: string;
  activity_type: string;
  user: { id: string; display_name: string; name: string };
}

interface Props {
  organization: Organization | null;
  datasets: DatasetIndexEntry[];
  tags: { name: string; count: number }[];
  formats: { name: string; count: number }[];
  licenses: { name: string; count: number }[];
  activityStream: ActivityStreamEntry[];
}

export default function OrganizationPage({ organization, datasets, tags, formats, licenses, activityStream }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState<'relevance' | 'date'>('relevance');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const [activeLicense, setActiveLicense] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllFormats, setShowAllFormats] = useState(false);
  const [showAllLicenses, setShowAllLicenses] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      const qParam = router.query.q;
      if (typeof qParam === 'string' && qParam !== query) {
        setQuery(qParam);
        setSearchInput(qParam);
      }
      const sortParam = router.query.sort;
      if (typeof sortParam === 'string' && sortParam !== sort) {
        setSort(sortParam as any);
      }
      const tagParam = router.query.tags;
      if (typeof tagParam === 'string' && tagParam !== activeTag) {
        setActiveTag(tagParam);
      }
      const fmtParam = router.query.res_format;
      if (typeof fmtParam === 'string' && fmtParam !== activeFormat) {
        setActiveFormat(fmtParam);
      }
      const licParam = router.query.license_id;
      if (typeof licParam === 'string' && licParam !== activeLicense) {
        setActiveLicense(licParam);
      }
    }
  }, [router.query.q, router.query.sort, router.query.tags, router.query.res_format, router.query.license_id, router.isReady]);

  const { idx, idMap } = useMemo(() => {
    const idMap: Record<string, DatasetIndexEntry> = {};
    const idx = lunr(function () {
      this.ref('id');
      this.field('title');
      this.field('description');
      this.field('tags');
      datasets.forEach((ds) => {
        idMap[ds.id] = ds;
        this.add({
          id: ds.id,
          title: ds.title,
          description: ds.description,
          tags: ds.tags.join(' '),
        });
      });
    });
    return { idx, idMap };
  }, [datasets]);

  const searched = useMemo(() => {
    if (!query) return datasets;
    try {
      const results = idx.search(`*${query}*`);
      return results.map((r: any) => idMap[r.ref]).filter(Boolean);
    } catch {
      return [];
    }
  }, [query, idx, idMap, datasets]);

  const filtered = useMemo(() => {
    return searched.filter(ds => {
      if (activeTag && !(ds.tags || []).includes(activeTag)) return false;
      if (activeFormat && !(ds.formats || []).includes(activeFormat)) return false;
      if (activeLicense && !(ds.licenses || []).includes(activeLicense)) return false;
      return true;
    });
  }, [searched, activeTag, activeFormat, activeLicense]);

  const sorted = useMemo(() => {
    if (sort === 'date') {
      return [...filtered].sort((a, b) => {
        const dateA = new Date(a.modified || a.created || 0).getTime();
        const dateB = new Date(b.modified || b.created || 0).getTime();
        return dateB - dateA;
      });
    }
    return filtered;
  }, [filtered, sort]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [query, activeTag, activeFormat, activeLicense]);

  function updateQueryParam(param: string, value: string | null) {
    const queryObj = { ...router.query };
    if (value) {
      queryObj[param] = value;
    } else {
      delete queryObj[param];
    }
    router.push({ pathname: router.pathname, query: { ...queryObj, name: router.query.name } }, undefined, { shallow: true });
    setPage(1);
  }

  const isActive = (val: string | null, current: string) => val === current;
  const filterBtn = (label: string, active: boolean, onClick: () => void, count?: number) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: active ? '#ff5722' : '#f3f4f6',
        color: active ? '#fff' : '#222',
        border: 'none',
        borderRadius: 6,
        padding: '6px 12px',
        marginBottom: 6,
        cursor: 'pointer',
        fontWeight: active ? 'bold' : 'normal',
        fontSize: '1rem',
        textAlign: 'left',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      title={label}
    >
      <span style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 150,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}>{label}</span>
      <span style={{ marginLeft: 10, color: active ? '#fff' : '#888', fontWeight: 'normal', flexShrink: 0 }}>{count !== undefined ? count : ''}</span>
    </button>
  );

  const activeFilters: { label: string; value: string; onRemove: () => void; type: string }[] = [];
  if (activeTag) activeFilters.push({ label: activeTag, value: activeTag, onRemove: () => { setActiveTag(null); updateQueryParam('tags', null); }, type: 'Tag' });
  if (activeFormat) activeFilters.push({ label: activeFormat, value: activeFormat, onRemove: () => { setActiveFormat(null); updateQueryParam('res_format', null); }, type: 'Format' });
  if (activeLicense) activeFilters.push({ label: activeLicense, value: activeLicense, onRemove: () => { setActiveLicense(null); updateQueryParam('license_id', null); }, type: 'License' });

  const datasetsContentProps = {
    searchInput, setSearchInput, query, setQuery, sort, setSort,
    paged, totalPages, page, setPage, activeFilters, filterBtn, styles,
    updateQueryParam, showAllTags, setShowAllTags, showAllFormats, setShowAllFormats, showAllLicenses, setShowAllLicenses,
    tags, formats, licenses, activeTag, setActiveTag, activeFormat, setActiveFormat, activeLicense, setActiveLicense,
    sorted
  };

  function timeAgo(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
    return `${Math.floor(diff / 31536000)} years ago`;
  }

  const ActivityStreamContent = () => {
    if (!activityStream || activityStream.length === 0) {
      return (
        <div style={{ color: '#888', fontSize: '1.05rem', marginTop: 32 }}>No activity found for this organization.</div>
      );
    }
    return (
      <section style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 18 }}>Activity Stream</h3>
        <div style={{ borderLeft: '3px solid #ff5722', marginLeft: 8, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {activityStream.map((act, i) => (
            <div key={act.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 22, color: '#ff5722', marginTop: 2 }}>
                {(act.user && act.user.display_name && act.user.display_name !== act.user.id)
                  ? act.user.display_name[0].toUpperCase()
                  : (act.user && act.user.id ? act.user.id[0] : '?')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: '#ff5722', fontSize: '1.08rem' }}>{getActivityMessage(act)}</div>
                <div style={{ color: '#888', fontSize: '0.98rem' }}>{timeAgo(act.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const AboutContent = () => (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
      <h3 style={{ fontSize: '1.3rem', marginBottom: 16, color: '#ff5722' }}>About {organization.title}</h3>
      
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: 8, color: '#333' }}>Description</h4>
        <p style={{ color: '#666', lineHeight: 1.6 }}>
          {organization.description || 'No description available for this organization.'}
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: 8, color: '#333' }}>Statistics</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff5722' }}>{organization.num_followers || 0}</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Followers</div>
          </div>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff5722' }}>{organization.package_count || datasets.length}</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Datasets</div>
          </div>
          {organization.created && (
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff5722' }}>{new Date(organization.created).getFullYear()}</div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Created</div>
            </div>
          )}
        </div>
      </div>

      {organization.extras && organization.extras.length > 0 && (
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: 8, color: '#333' }}>Additional Information</h4>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
            {organization.extras.map((extra: any, index: number) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <strong style={{ color: '#333' }}>{extra.key}:</strong> {extra.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const orgName = organization.name;
  const activeTab = (() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith(`/organization/activity/`)) return 'activity';
      if (window.location.pathname.startsWith(`/organization/about/`)) return 'about';
    }
    return 'datasets';
  })();

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
            <h2 className={styles.orgTitle}>
              {organization.title}
            </h2>
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
                <div className={styles.orgStatNum}>{organization.package_count || datasets.length}</div>
                <div>Datasets</div>
              </div>
            </div>
          </div>
          <div className={styles.currentOrgFilter}>
            <h3 className={styles.filterTitle}>Current Organization</h3>
            <div className={styles.currentOrgName}>
              {organization.title}
            </div>
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
              }}>Activity</a>
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
          <DatasetsContent {...datasetsContentProps} />
        </main>
      </div>
    </div>
  );
}

function DatasetsContent({
  searchInput, setSearchInput, query, setQuery, sort, setSort,
  paged, totalPages, page, setPage, activeFilters, filterBtn, styles,
  updateQueryParam, showAllTags, setShowAllTags, showAllFormats, setShowAllFormats, showAllLicenses, setShowAllLicenses,
  tags, formats, licenses, activeTag, setActiveTag, activeFormat, setActiveFormat, activeLicense, setActiveLicense,
  sorted
}: any) {
  return (
    <div>
      <form onSubmit={e => { e.preventDefault(); setQuery(searchInput); updateQueryParam('q', searchInput); }} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Search datasets..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchBtn}>Search</button>
        <label className={styles.sortLabel}>Order by:</label>
        <select
          value={sort}
          onChange={e => {
            setSort(e.target.value as any);
            updateQueryParam('sort', e.target.value);
          }}
          className={styles.sortSelect}
        >
          <option value="relevance">Relevance</option>
          <option value="date">Date</option>
        </select>
      </form>
      <div style={{ marginBottom: 20, color: '#888', fontSize: '1.05rem' }}>
        {sorted.length} datasets found
      </div>
      {activeFilters.length > 0 && (
        <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {activeFilters.map(f => (
            <span key={f.type + f.value} style={{ background: '#ff5722', color: '#fff', borderRadius: 6, padding: '4px 10px', display: 'flex', alignItems: 'center', fontSize: '0.97rem', fontWeight: 'bold' }}>
              {f.type}: {f.label}
              <button onClick={f.onRemove} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer', lineHeight: 1 }} title="Remove filter">×</button>
            </span>
          ))}
        </div>
      )}
      <div>
        {paged.map(ds => (
          <div key={ds.id} style={{ 
            background: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: 12, 
            boxShadow: '0 2px 8px #0001', 
            padding: 20, 
            marginBottom: 24, 
            transition: 'box-shadow 0.2s', 
            cursor: 'pointer' 
          }}
            onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 16px #0002')}
            onMouseOut={e => (e.currentTarget.style.boxShadow = '0 2px 8px #0001')}
          >
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ff5722' }}>
              <Link href={`/dataset/${ds.id}`}>{ds.title}</Link>
            </h2>
            <div style={{ 
              color: '#444', 
              margin: '10px 0 8px 0', 
              fontSize: '1.05rem', 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {ds.description}
            </div>
            <div style={{ marginTop: 8 }}>
              {ds.path && (
                <DatasetFormats path={ds.path} />
              )}
            </div>
          </div>
        ))}
        {paged.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 40, 
            color: '#888', 
            fontSize: '1.1rem' 
          }}>
            No datasets found.
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            style={{ 
              margin: '0 6px', 
              padding: '8px 14px', 
              borderRadius: 6, 
              border: '1px solid #ddd', 
              background: '#fff', 
              color: page === 1 ? '#bbb' : '#ff5722', 
              fontWeight: 'bold', 
              cursor: page === 1 ? 'not-allowed' : 'pointer' 
            }}
          >
            {'<'}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              style={{ 
                margin: '0 6px', 
                padding: '8px 14px', 
                borderRadius: 6, 
                border: pageNum === page ? '1px solid #ff5722' : '1px solid #ddd', 
                background: pageNum === page ? '#ff5722' : '#fff', 
                color: pageNum === page ? '#fff' : '#ff5722', 
                fontWeight: 'bold', 
                cursor: 'pointer' 
              }}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            style={{ 
              margin: '0 6px', 
              padding: '8px 14px', 
              borderRadius: 6, 
              border: '1px solid #ddd', 
              background: '#fff', 
              color: page === totalPages ? '#bbb' : '#ff5722', 
              fontWeight: 'bold', 
              cursor: page === totalPages ? 'not-allowed' : 'pointer' 
            }}
          >
            {'>'}
          </button>
        </div>
      )}
    </div>
  );
}

function DatasetFormats({ path }: { path: string }) {
  const [formats, setFormats] = useState<string[]>([]);
  useEffect(() => {
    fetch(`/${path}`)
      .then(res => res.json())
      .then((dp) => {
        const fmts = Array.isArray(dp.resources)
          ? Array.from(new Set(dp.resources.map((r: any) => (r.format || '').toUpperCase()).filter(Boolean)))
          : [];
        setFormats(fmts as string[]);
      });
  }, [path]);
  
  const formatColors: Record<string, string> = {
    CSV: '#ff5722',
    XLS: '#059669',
    JSON: '#f59e42',
    PDF: '#dc2626',
    XML: '#7c3aed',
    API: '#0ea5e9',
    HTML: '#eab308',
    DEFAULT: '#64748b',
  };
  
  return (
    <span style={{ display: 'flex', gap: 8 }}>
      {formats.map(fmt => (
        <span key={fmt} style={{
          background: formatColors[fmt] || formatColors.DEFAULT,
          color: '#fff',
          borderRadius: 6,
          padding: '4px 14px',
          fontWeight: 'bold',
          fontSize: '1rem',
          letterSpacing: 1,
        }}>
          {fmt}
        </span>
      ))}
    </span>
  );
}

function getPaginationPages(current: number, total: number) {
  const maxVisible = 5;
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [];
  if (current <= 3) {
    pages.push(1, 2, 3, '...', total);
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const indexPath = path.join(process.cwd(), 'organizations-index.json');
  let organizations = [];
  
  try {
    const raw = fs.readFileSync(indexPath, 'utf-8');
    organizations = JSON.parse(raw);
  } catch (e) {
    organizations = [];
  }
  
  const paths = organizations.map((org: any) => ({ params: { name: org.name } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { name } = context.params as { name: string };
  
  const orgPath = path.join(process.cwd(), 'datasets', name, 'organization.json');
  let organization = null;
  
  try {
    const raw = fs.readFileSync(orgPath, 'utf-8');
    organization = JSON.parse(raw);
  } catch (e) {
    organization = null;
  }
  
  const datasetsIndexPath = path.join(process.cwd(), 'datasets-index.json');
  let allDatasets = [];
  
  try {
    const raw = fs.readFileSync(datasetsIndexPath, 'utf-8');
    allDatasets = JSON.parse(raw);
  } catch (e) {
    allDatasets = [];
  }
  
  let datasets = [];
  if (organization && organization.title) {
    datasets = allDatasets.filter((ds: any) => {
      return ds.organization && ds.organization.trim() === organization.title;
    });
  } else {
    datasets = [];
  }
  
  const tagCounts: Record<string, number> = {};
  datasets.forEach((ds: any) => {
    (ds.tags || []).forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const tags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const formatCounts: Record<string, number> = {};
  datasets.forEach((ds: any) => {
    (ds.formats || []).forEach((fmt: string) => {
      const name = fmt.toUpperCase();
      formatCounts[name] = (formatCounts[name] || 0) + 1;
    });
  });
  const formats = Object.entries(formatCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const licenseCounts: Record<string, number> = {};
  datasets.forEach((ds: any) => {
    (ds.licenses || []).forEach((lic: string) => {
      licenseCounts[lic] = (licenseCounts[lic] || 0) + 1;
    });
  });
  const licenses = Object.entries(licenseCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  
  const activityPath = path.join(process.cwd(), 'datasets', name, 'activity_stream.json');
  let activityStream = [];
  try {
    const raw = fs.readFileSync(activityPath, 'utf-8');
    activityStream = JSON.parse(raw);
  } catch (e) {
    activityStream = [];
  }
  
  return { 
    props: { 
      organization,
      datasets,
      tags,
      formats,
      licenses,
      activityStream
    } 
  };
};

function getActivityMessage(act: any) {
  const user = act.user && act.user.display_name && act.user.display_name !== act.user.id
    ? act.user.display_name
    : (act.user && act.user.id ? act.user.id.slice(0, 6) : 'Unknown');
  const type = act.activity_type;
  if (type === 'new package') {
    return `${user} created the dataset "${act.data?.package?.title || act.data?.package?.name || ''}"`;
  }
  if (type === 'changed package') {
    return `${user} updated the dataset "${act.data?.package?.title || act.data?.package?.name || ''}"`;
  }
  if (type === 'new resource') {
    return `${user} added the resource "${act.data?.resource?.name || ''}" to the dataset "${act.data?.package?.title || act.data?.package?.name || ''}"`;
  }
  if (type === 'changed resource') {
    return `${user} updated the resource "${act.data?.resource?.name || ''}" in the dataset "${act.data?.package?.title || act.data?.package?.name || ''}"`;
  }
  if (type === 'deleted resource') {
    return `${user} deleted the resource "${act.data?.resource?.name || ''}" from the dataset "${act.data?.package?.title || act.data?.package?.name || ''}"`;
  }
  if (type === 'changed organization') {
    return `${user} updated the organization "${act.data?.organization?.title || act.data?.organization?.name || ''}"`;
  }
  if (type === 'new organization') {
    return `${user} created the organization "${act.data?.organization?.title || act.data?.organization?.name || ''}"`;
  }
  return `${user} did ${type}`;
} 