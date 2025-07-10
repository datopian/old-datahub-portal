import fs from 'fs';
import path from 'path';
import { GetStaticProps } from 'next';
import { useState, useMemo } from 'react';
import lunr from 'lunr';
import Link from 'next/link';
import styles from '../../styles/OrganizationsListPage.module.css';

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
  const safeOrganizations = Array.isArray(organizations) ? organizations : [];
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'name' | 'packages' | 'date'>('name');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { idx, idMap } = useMemo(() => {
    const idMap: Record<string, OrganizationIndexEntry> = {};
    const idx = lunr(function () {
      this.ref('id');
      this.field('name');
      this.field('title');
      this.field('description');
      safeOrganizations.forEach((org) => {
        idMap[org.id] = org;
        this.add({
          id: org.id,
          name: org.name,
          title: org.title,
          description: org.description,
        });
      });
    });
    return { idx, idMap };
  }, [safeOrganizations]);

  const searched = useMemo(() => {
    if (!query) return safeOrganizations;
    try {
      const results = idx.search(`*${query}*`);
      return results.map((r: any) => idMap[r.ref]).filter(Boolean);
    } catch {
      return [];
    }
  }, [query, idx, idMap, safeOrganizations]);

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
      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.headerBlock}>
          <h1 className={styles.pageTitle}>What are Organisations?</h1>
          <p className={styles.pageDesc}>
            CKAN Organisations are used to create, manage and publish collections of datasets. Users can have different roles within an Organisation, depending on their level of authorisation to create, edit and publish.
          </p>
        </div>

        {/* Search and sorting */}
        <div className={styles.searchSortRow}>
          <input
            type="text"
            placeholder="Search organizations..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={styles.searchInput}
          />
          <label className={styles.sortLabel}>Sort by:</label>
          <select 
            value={sort} 
            onChange={e => setSort(e.target.value as any)} 
            className={styles.sortSelect}
          >
            <option value="name">Name</option>
            <option value="packages">Datasets</option>
            <option value="date">Date</option>
          </select>
        </div>

        {/* Statistics */}
        <div className={styles.statsText}>
          {sorted.length} organizations found
        </div>

        {/* Organizations grid */}
        <div className={styles.orgGrid}>
          {paged.map(org => (
            <Link key={org.id} href={`/organizations/${org.name}`} style={{ textDecoration: 'none' }}>
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
                {/* Logo */}
                <div className={styles.orgLogoWrap}>
                  <img 
                    src={org.image_url || '/images/logos/DefaultOrgLogo.svg'} 
                    alt={org.title}
                    className={styles.orgLogo}
                  />
                </div>

                {/* Name */}
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