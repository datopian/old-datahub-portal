import fs from 'fs';
import path from 'path';
import { GetStaticProps } from 'next';
import { useState, useMemo, useEffect, useRef } from 'react';
import lunr from 'lunr';
import Link from 'next/link';
import styles from '../../styles/OrganizationsListPage.module.css';
import { useRouter } from 'next/router';
import Breadcrumbs from '@/components/_shared/Breadcrumbs';

interface OrganizationIndexEntry {
  id: string;
  name: string;
  title: string;
  description: string;
  image_url?: string;
  created?: string;
  packages: number;
  path: string;
}

interface Props {
  organizations: OrganizationIndexEntry[];
}

export default function OrganizationsListPage({ organizations }: Props) {
  const router = useRouter();
  const safeOrganizations = Array.isArray(organizations) ? organizations : [];
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'name' | 'packages' | 'date'>('name');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [idx, setIdx] = useState<lunr.Index | null>(null);
  const [loadingIdx, setLoadingIdx] = useState(true);
  const idMapRef = useRef<Record<string, OrganizationIndexEntry>>({});

  useEffect(() => {
    const idMap: Record<string, OrganizationIndexEntry> = {};
    safeOrganizations.forEach(org => {
        idMap[org.id] = org;
    });
    idMapRef.current = idMap;
    setLoadingIdx(true);
    fetch('/data/lunr-org-index.json')
      .then(res => res.json())
      .then(idxJson => {
        setIdx(lunr.Index.load(idxJson));
        setLoadingIdx(false);
      })
      .catch(() => setLoadingIdx(false));
  }, [safeOrganizations]);

  useEffect(() => {
    if (router.isReady) {
      const qParam = router.query.q;
      if (typeof qParam === 'string' && qParam !== query) {
        setQuery(qParam);
      }
      const sortParam = router.query.sort;
      if (typeof sortParam === 'string' && sortParam !== sort) {
        setSort(sortParam as any);
      }
    }
  }, [router.query.q, router.query.sort, router.isReady]);

  const searched = useMemo(() => {
    if (loadingIdx) return [];
    if (!query || !idx) return safeOrganizations;
    try {
      const results = idx.search(`*${query}*`);
      return results.map((r: any) => idMapRef.current[r.ref]).filter(Boolean);
    } catch {
      return [];
    }
  }, [query, idx, safeOrganizations, loadingIdx]);

  const sorted = useMemo(() => {
    return [...searched].sort((a, b) => {
      switch (sort) {
        case 'packages':
          return b.packages - a.packages;
        case 'date':
          const dateA = new Date(a.created || 0).getTime();
          const dateB = new Date(b.created || 0).getTime();
          return dateB - dateA;
        case 'name':
        default:
          return a.title.localeCompare(b.title);
      }
    });
  }, [searched, sort]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  useMemo(() => { setPage(1); }, [query, sort]);

  function updateQueryParam(param: string, value: string | null) {
    const queryObj = { ...router.query };
    if (value) {
      queryObj[param] = value;
    } else {
      delete queryObj[param];
    }
    router.push({ pathname: '/organization', query: queryObj }, undefined, { shallow: true });
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

  return (
    <div className={styles.pageBg}>
      <div style={{ margin: '-22px 0 12px 0' }}>
        <Breadcrumbs items={[{ label: 'Organizations' }]} />
        <div style={{ borderBottom: '1px solid #e5e7eb', marginTop: 12 }} />
      </div>
      <div className={styles.pageContainer}>
        <div className={styles.headerBlock}>
          <h1 className={styles.pageTitle}>What are Organisations?</h1>
          <p className={styles.pageDesc}>
            CKAN Organisations are used to create, manage and publish collections of datasets. Users can have different roles within an Organisation, depending on their level of authorisation to create, edit and publish.
          </p>
        </div>

        <div className={styles.searchSortRow}>
          <input
            type="text"
            placeholder="Search organizations..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              updateQueryParam('q', e.target.value);
            }}
            className={styles.searchInput}
          />
          <label className={styles.sortLabel}>Sort by:</label>
          <select 
            value={sort} 
            onChange={e => {
              setSort(e.target.value as any);
              updateQueryParam('sort', e.target.value);
            }}
            className={styles.sortSelect}
          >
            <option value="name">Name</option>
            <option value="packages">Datasets</option>
            <option value="date">Date</option>
          </select>
        </div>

        <div className={styles.statsText}>
          {loadingIdx ? 'Loading organizations…' : `${sorted.length} organizations found`}
        </div>

        <div className={styles.orgGrid}>
          {paged.map(org => (
            <Link key={org.id} href={`/organization/${org.name}`} style={{ textDecoration: 'none' }}>
              <div className={styles.orgCard}
                onMouseOver={e => {
                  e.currentTarget.style.boxShadow = '0 4px 16px #0002';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.boxShadow = '0 2px 8px #0001';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className={styles.orgLogoWrap}>
                  <img 
                    src={org.image_url || '/images/logos/DefaultOrgLogo.svg'} 
                    alt={org.title}
                    className={styles.orgLogo}
                  />
                </div>

                <h2 className={styles.orgCardTitle}>
                  {org.title}
                </h2>

                <p className={styles.orgCardDesc}>
                  {org.description || 'No description available.'}
                </p>

                <div className={styles.orgCardStats}>
                  <span>
                    {org.packages} dataset{org.packages !== 1 ? 's' : ''}
                  </span>
                  {org.created && (
                    <span>
                      {new Date(org.created).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ textAlign: 'center' }}>
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
            {getPaginationPages(page, totalPages).map((pageNum, index) => (
              pageNum === '...'
                ? <span key={`ellipsis-${index}`} style={{ margin: '0 6px', padding: '8px 14px', color: '#888' }}>...</span>
                : <button
                    key={pageNum}
                    onClick={() => setPage(pageNum as number)}
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
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const filePath = path.join(process.cwd(), 'organizations-index.json');
  
  let organizations = [];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    organizations = JSON.parse(raw);
  } catch (e) {
    console.warn('Organizations index not found, using empty array');
    organizations = [];
  }

  return {
    props: {
      organizations
    }
  };
}; 