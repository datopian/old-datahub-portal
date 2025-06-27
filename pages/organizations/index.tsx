import fs from 'fs';
import path from 'path';
import { GetStaticProps } from 'next';
import { useState, useMemo } from 'react';
import lunr from 'lunr';
import Link from 'next/link';

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

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 16px 0', color: '#1d4ed8' }}>What are Organisations?</h1>
          <p style={{ fontSize: '1.1rem', color: '#666', margin: '0 0 24px 0', lineHeight: 1.6 }}>
            CKAN Organisations are used to create, manage and publish collections of datasets. Users can have different roles within an Organisation, depending on their level of authorisation to create, edit and publish.
          </p>
        </div>

        {/* Search and sorting */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <input
            type="text"
            placeholder="Search organizations..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ 
              flex: 1, 
              padding: 12, 
              fontSize: '1rem', 
              borderRadius: 8, 
              border: '1px solid #ddd', 
              background: '#fff' 
            }}
          />
          <label style={{ color: '#555', whiteSpace: 'nowrap' }}>Sort by:</label>
          <select 
            value={sort} 
            onChange={e => setSort(e.target.value as any)} 
            style={{ 
              padding: 8, 
              borderRadius: 6, 
              border: '1px solid #ddd', 
              background: '#fff' 
            }}
          >
            <option value="name">Name</option>
            <option value="packages">Datasets</option>
            <option value="date">Date</option>
          </select>
        </div>

        {/* Statistics */}
        <div style={{ marginBottom: 24, color: '#888', fontSize: '1.05rem' }}>
          {sorted.length} organizations found
        </div>

        {/* Organizations grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: 24, 
          marginBottom: 40 
        }}>
          {paged.map(org => (
            <Link key={org.id} href={`/organizations/${org.name}`} style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: '#fff', 
                border: '1px solid #e5e7eb', 
                borderRadius: 12, 
                boxShadow: '0 2px 8px #0001', 
                padding: 24, 
                transition: 'all 0.2s',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
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
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <img 
                    src={org.image_url || '/images/logos/DefaultOrgLogo.svg'} 
                    alt={org.title}
                    style={{ 
                      width: 80, 
                      height: 80, 
                      objectFit: 'contain',
                      borderRadius: 8
                    }} 
                  />
                </div>

                {/* Name */}
                <h2 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '1.3rem', 
                  color: '#1d4ed8',
                  textAlign: 'center'
                }}>
                  {org.title}
                </h2>

                <p style={{ 
                  color: '#666', 
                  margin: '0 0 16px 0', 
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {org.description || 'No description available.'}
                </p>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px 0',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>
                    {org.packages} dataset{org.packages !== 1 ? 's' : ''}
                  </span>
                  {org.created && (
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>
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
                color: page === 1 ? '#bbb' : '#2563eb', 
                fontWeight: 'bold', 
                cursor: page === 1 ? 'not-allowed' : 'pointer' 
              }}
            >
              {'<'}
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                style={{ 
                  margin: '0 6px', 
                  padding: '8px 14px', 
                  borderRadius: 6, 
                  border: i + 1 === page ? '1px solid #2563eb' : '1px solid #ddd', 
                  background: i + 1 === page ? '#2563eb' : '#fff', 
                  color: i + 1 === page ? '#fff' : '#2563eb', 
                  fontWeight: 'bold', 
                  cursor: 'pointer' 
                }}
              >
                {i + 1}
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
                color: page === totalPages ? '#bbb' : '#2563eb', 
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