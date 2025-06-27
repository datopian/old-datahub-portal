import fs from 'fs';
import path from 'path';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useState, useMemo } from 'react';
import lunr from 'lunr';
import Link from 'next/link';
import Tabs from '@/components/_shared/Tabs';

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

interface Props {
  organization: Organization | null;
  datasets: DatasetIndexEntry[];
  tags: { name: string; count: number }[];
  formats: { name: string; count: number }[];
  licenses: { name: string; count: number }[];
}

export default function OrganizationPage({ organization, datasets, tags, formats, licenses }: Props) {
  const [query, setQuery] = useState('');
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

  if (!organization) {
    return (
      <div style={{ padding: 32 }}>
        <div>Organization not found.</div>
      </div>
    );
  }

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

  useMemo(() => { setPage(1); }, [query, activeTag, activeFormat, activeLicense]);

  const isActive = (val: string | null, current: string) => val === current;
  const filterBtn = (label: string, active: boolean, onClick: () => void, count?: number) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: active ? '#2563eb' : '#f3f4f6',
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
  if (activeTag) activeFilters.push({ label: activeTag, value: activeTag, onRemove: () => setActiveTag(null), type: 'Tag' });
  if (activeFormat) activeFilters.push({ label: activeFormat, value: activeFormat, onRemove: () => setActiveFormat(null), type: 'Format' });
  if (activeLicense) activeFilters.push({ label: activeLicense, value: activeLicense, onRemove: () => setActiveLicense(null), type: 'License' });

  // Datasets tab content
  const DatasetsContent = () => (
    <div>
      {/* Search and sorting */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search datasets..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ 
            flex: 1, 
            padding: 12, 
            fontSize: '1rem', 
            marginRight: 16, 
            borderRadius: 8, 
            border: '1px solid #ddd', 
            background: '#fff' 
          }}
        />
        <label style={{ marginRight: 8, color: '#555' }}>Order by:</label>
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
          <option value="relevance">Relevance</option>
          <option value="date">Date</option>
        </select>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: 20, color: '#888', fontSize: '1.05rem' }}>
        {filtered.length} datasets found
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {activeFilters.map(f => (
            <span key={f.type + f.value} style={{ background: '#2563eb', color: '#fff', borderRadius: 6, padding: '4px 10px', display: 'flex', alignItems: 'center', fontSize: '0.97rem', fontWeight: 'bold' }}>
              {f.type}: {f.label}
              <button onClick={f.onRemove} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer', lineHeight: 1 }} title="Remove filter">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Datasets list */}
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
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1d4ed8' }}>
              <Link href={`/datasets/${ds.id}`}>{ds.title}</Link>
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

      {/* Pagination */}
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
  );

  // Activity Stream tab content
  const ActivityStreamContent = () => (
    <div style={{ 
      textAlign: 'center', 
      padding: 40, 
      color: '#888', 
      fontSize: '1.1rem' 
    }}>
      <div style={{ marginBottom: 16 }}>
        <img src="/images/icons/clock.svg" alt="Activity" style={{ width: 48, height: 48, opacity: 0.5 }} />
      </div>
      <h3 style={{ marginBottom: 8, color: '#666' }}>Activity Stream</h3>
      <p>No activity data available for this organization.</p>
    </div>
  );

  // About tab content
  const AboutContent = () => (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
      <h3 style={{ fontSize: '1.3rem', marginBottom: 16, color: '#1d4ed8' }}>About {organization.title}</h3>
      
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
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8' }}>{organization.num_followers || 0}</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Followers</div>
          </div>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8' }}>{organization.package_count || datasets.length}</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Datasets</div>
          </div>
          {organization.created && (
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8' }}>{new Date(organization.created).getFullYear()}</div>
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

  const tabs = [
    {
      id: 'datasets',
      label: 'Datasets',
      content: <DatasetsContent />
    },
    {
      id: 'activity',
      label: 'Activity Stream',
      content: <ActivityStreamContent />
    },
    {
      id: 'about',
      label: 'About',
      content: <AboutContent />
    }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto' }}>
        {/* Left column: Organization info and filters */}
        <aside style={{ width: 320, marginRight: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, height: 'fit-content' }}>
          {/* Organization info */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img 
              src={organization.image_url || '/images/logos/DefaultOrgLogo.svg'} 
              alt={organization.title}
              style={{ 
                width: 80, 
                height: 80, 
                objectFit: 'contain',
                borderRadius: 8,
                marginBottom: 12
              }} 
            />
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 8px 0', color: '#1d4ed8' }}>
              {organization.title}
            </h2>
            <div style={{ textAlign: 'left' }}>
              <p style={{ 
                fontSize: '0.95rem', 
                color: '#666', 
                margin: '0 0 16px 0',
                lineHeight: 1.5,
                display: showFullDescription ? 'block' : '-webkit-box',
                WebkitLineClamp: showFullDescription ? 'unset' : 2,
                WebkitBoxOrient: showFullDescription ? 'unset' : 'vertical',
                overflow: showFullDescription ? 'visible' : 'hidden',
                textOverflow: showFullDescription ? 'unset' : 'ellipsis'
              }}>
                {organization.description || 'No description available.'}
              </p>
              {organization.description && organization.description.length > 100 && (
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    padding: 0,
                    marginBottom: 16
                  }}
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.9rem', color: '#888' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#1d4ed8' }}>{organization.num_followers || 0}</div>
                <div>Followers</div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#1d4ed8' }}>{organization.package_count || datasets.length}</div>
                <div>Datasets</div>
              </div>
            </div>
          </div>

          {/* Current organization filter (always active) */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 8, color: '#555' }}>Current Organization</h3>
            <div style={{
              background: '#2563eb',
              color: '#fff',
              borderRadius: 6,
              padding: '8px 12px',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              textAlign: 'center'
            }}>
              {organization.title}
            </div>
          </div>

          {/* Tags filter */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 8, color: '#555' }}>Tags</h3>
            <div>
              {(showAllTags ? tags : tags.slice(0, 10)).map(tag => 
                filterBtn(tag.name, isActive(activeTag, tag.name), () => setActiveTag(activeTag === tag.name ? null : tag.name), tag.count)
              )}
              {tags.length > 10 && (
                <button onClick={() => setShowAllTags(v => !v)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', marginTop: 4 }}>
                  {showAllTags ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>

          {/* Formats filter */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 8, color: '#555' }}>Formats</h3>
            <div>
              {(showAllFormats ? formats : formats.slice(0, 10)).map(fmt => 
                filterBtn(fmt.name.toUpperCase(), isActive(activeFormat, fmt.name.toUpperCase()), () => setActiveFormat(activeFormat === fmt.name.toUpperCase() ? null : fmt.name.toUpperCase()), fmt.count)
              )}
              {formats.length > 10 && (
                <button onClick={() => setShowAllFormats(v => !v)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', marginTop: 4 }}>
                  {showAllFormats ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>

          {/* Licenses filter */}
          <div style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 8, color: '#555' }}>Licenses</h3>
            <div>
              {(showAllLicenses ? licenses : licenses.slice(0, 10)).map(lic => 
                filterBtn(lic.name, isActive(activeLicense, lic.name), () => setActiveLicense(activeLicense === lic.name ? null : lic.name), lic.count)
              )}
              {licenses.length > 10 && (
                <button onClick={() => setShowAllLicenses(v => !v)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', marginTop: 4 }}>
                  {showAllLicenses ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main content: Tabs */}
        <main style={{ flex: 1 }}>
          <Tabs tabs={tabs} defaultTab="datasets" />
        </main>
      </div>
    </div>
  );
}

function getAbsoluteUrl(relativePath: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${relativePath}`;
  }
  return relativePath;
}

function DatasetFormats({ path }: { path: string }) {
  const [formats, setFormats] = useState<string[]>([]);
  
  useState(() => {
    const url = getAbsoluteUrl(`/data/${path}`);
    fetch(url)
      .then(res => res.json())
      .then((dp) => {
        const fmts = Array.isArray(dp.resources)
          ? Array.from(new Set(dp.resources.map((r: any) => (r.format || '').toUpperCase()).filter(Boolean)))
          : [];
        setFormats(fmts as string[]);
      });
  });
  
  const formatColors: Record<string, string> = {
    CSV: '#2563eb',
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

export const getStaticPaths: GetStaticPaths = async () => {
  const indexPath = path.join(process.cwd(), 'public/data/organizations-index.json');
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
  
  // Load organization data
  const orgPath = path.join(process.cwd(), 'public/data/organizations', name, 'organization.json');
  let organization = null;
  
  try {
    const raw = fs.readFileSync(orgPath, 'utf-8');
    organization = JSON.parse(raw);
  } catch (e) {
    organization = null;
  }
  
  // Load datasets for this organization
  const datasetsIndexPath = path.join(process.cwd(), 'public/data/datasets-index.json');
  let allDatasets = [];
  
  try {
    const raw = fs.readFileSync(datasetsIndexPath, 'utf-8');
    allDatasets = JSON.parse(raw);
  } catch (e) {
    allDatasets = [];
  }
  
  const datasets = allDatasets.filter((ds: any) => ds.organization === name);
  
  // Calculate tag counts
  const tagCounts: Record<string, number> = {};
  datasets.forEach((ds: any) => {
    (ds.tags || []).forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const tags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  // Calculate format counts
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

  // Calculate license counts
  const licenseCounts: Record<string, number> = {};
  datasets.forEach((ds: any) => {
    (ds.licenses || []).forEach((lic: string) => {
      licenseCounts[lic] = (licenseCounts[lic] || 0) + 1;
    });
  });
  const licenses = Object.entries(licenseCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  
  return { 
    props: { 
      organization,
      datasets,
      tags,
      formats,
      licenses
    } 
  };
}; 