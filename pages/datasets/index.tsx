import fs from 'fs';
import path from 'path';
import { GetStaticProps } from 'next';
import { useState, useMemo } from 'react';
import lunr from 'lunr';
import Link from 'next/link';

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
  datasets: DatasetIndexEntry[];
  orgs: { name: string; count: number }[];
  tags: { name: string; count: number }[];
  formats: { name: string; count: number }[];
  licenses: { name: string; count: number }[];
}

export default function DatasetListPage({ datasets, orgs, tags, formats, licenses }: Props) {
  const safeDatasets = Array.isArray(datasets) ? datasets : [];
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'relevance' | 'date'>('relevance');
  const [activeOrg, setActiveOrg] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const [activeLicense, setActiveLicense] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showAllOrgs, setShowAllOrgs] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllFormats, setShowAllFormats] = useState(false);
  const [showAllLicenses, setShowAllLicenses] = useState(false);

  const { idx, idMap } = useMemo(() => {
    const idMap: Record<string, DatasetIndexEntry> = {};
    const idx = lunr(function () {
      this.ref('id');
      this.field('title');
      this.field('description');
      this.field('organization');
      this.field('tags');
      safeDatasets.forEach((ds) => {
        idMap[ds.id] = ds;
        this.add({
          id: ds.id,
          title: ds.title,
          description: ds.description,
          organization: ds.organization,
          tags: ds.tags.join(' '),
        });
      });
    });
    return { idx, idMap };
  }, [safeDatasets]);

  const searched = useMemo(() => {
    if (!query) return safeDatasets;
    try {
      const results = idx.search(`*${query}*`);
      return results.map((r: any) => idMap[r.ref]).filter(Boolean);
    } catch {
      return [];
    }
  }, [query, idx, idMap, safeDatasets]);

  const filtered = useMemo(() => {
    return searched.filter(ds => {
      if (activeOrg && ds.organization !== activeOrg) return false;
      if (activeTag && !(ds.tags || []).includes(activeTag)) return false;
      if (activeFormat && !(ds.formats || []).includes(activeFormat)) return false;
      if (activeLicense && !(ds.licenses || []).includes(activeLicense)) return false;
      return true;
    });
  }, [searched, activeOrg, activeTag, activeFormat, activeLicense]);

  const sorted = useMemo(() => {
    if (sort === 'date') {
      return [...filtered].sort((a, b) => {
        const dateA = new Date(a.modified || a.created || 0).getTime();
        const dateB = new Date(b.modified || b.created || 0).getTime();
        return dateB - dateA;
      }).reverse();
    }
    return filtered;
  }, [filtered, sort]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  useMemo(() => { setPage(1); }, [query, activeOrg, activeTag, activeFormat, activeLicense]);

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
  if (activeOrg) activeFilters.push({ label: activeOrg, value: activeOrg, onRemove: () => setActiveOrg(null), type: 'Organization' });
  if (activeTag) activeFilters.push({ label: activeTag, value: activeTag, onRemove: () => setActiveTag(null), type: 'Tag' });
  if (activeFormat) activeFilters.push({ label: activeFormat, value: activeFormat, onRemove: () => setActiveFormat(null), type: 'Format' });
  if (activeLicense) activeFilters.push({ label: activeLicense, value: activeLicense, onRemove: () => setActiveLicense(null), type: 'License' });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto' }}>
        <aside style={{ width: 260, marginRight: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Organizations</h3>
          <div style={{ marginBottom: 24 }}>
            {(showAllOrgs ? orgs : orgs.slice(0, 10)).map(org => filterBtn(org.name, isActive(activeOrg, org.name), () => setActiveOrg(activeOrg === org.name ? null : org.name), org.count))}
            {orgs.length > 10 && (
              <button onClick={() => setShowAllOrgs(v => !v)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', marginTop: 4 }}>
                {showAllOrgs ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Tags</h3>
          <div style={{ marginBottom: 24 }}>
            {(showAllTags ? tags : tags.slice(0, 10)).map(tag => filterBtn(tag.name, isActive(activeTag, tag.name), () => setActiveTag(activeTag === tag.name ? null : tag.name), tag.count))}
            {tags.length > 10 && (
              <button onClick={() => setShowAllTags(v => !v)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', marginTop: 4 }}>
                {showAllTags ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Formats</h3>
          <div style={{ marginBottom: 24 }}>
            {(showAllFormats ? formats : formats.slice(0, 10)).map(fmt => filterBtn(fmt.name.toUpperCase(), isActive(activeFormat, fmt.name.toUpperCase()), () => setActiveFormat(activeFormat === fmt.name.toUpperCase() ? null : fmt.name.toUpperCase()), fmt.count))}
            {formats.length > 10 && (
              <button onClick={() => setShowAllFormats(v => !v)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', marginTop: 4 }}>
                {showAllFormats ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Licenses</h3>
          <div style={{ marginBottom: 0 }}>
            {(showAllLicenses ? licenses : licenses.slice(0, 10)).map(lic => filterBtn(lic.name, isActive(activeLicense, lic.name), () => setActiveLicense(activeLicense === lic.name ? null : lic.name), lic.count))}
            {licenses.length > 10 && (
              <button onClick={() => setShowAllLicenses(v => !v)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', marginTop: 4 }}>
                {showAllLicenses ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </aside>
        <main style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <input
              type="text"
              placeholder="Search datasets..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ flex: 1, padding: 12, fontSize: '1rem', marginRight: 16, borderRadius: 8, border: '1px solid #ddd', background: '#fff' }}
            />
            <label style={{ marginRight: 8, color: '#555' }}>Order by:</label>
            <select value={sort} onChange={e => setSort(e.target.value as any)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', background: '#fff' }}>
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
            </select>
          </div>
          <div style={{ marginBottom: 20, color: '#888', fontSize: '1.05rem' }}>{filtered.length} datasets found</div>
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
          <div>
            {paged.map(ds => (
              <div key={ds.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 20, marginBottom: 24, transition: 'box-shadow 0.2s', cursor: 'pointer' }}
                onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 16px #0002')}
                onMouseOut={e => (e.currentTarget.style.boxShadow = '0 2px 8px #0001')}
              >
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1d4ed8' }}>
                  <Link href={`/datasets/${ds.id}`}>{ds.title}</Link>
                </h2>
                <div style={{ color: '#444', margin: '10px 0 8px 0', fontSize: '1.05rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ds.description}</div>
                <div style={{ fontSize: '0.97rem', color: '#666', marginBottom: 8 }}>
                  Organization: {ds.organization || <span style={{ color: '#bbb' }}>—</span>}
                </div>
                <div style={{ marginTop: 8 }}>
                  {ds.path && (
                    <DatasetFormats path={ds.path} />
                  )}
                </div>
              </div>
            ))}
            {paged.length === 0 && <div>No datasets found.</div>}
          </div>
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              style={{ margin: '0 6px', padding: '8px 14px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: page === 1 ? '#bbb' : '#2563eb', fontWeight: 'bold', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >{'<'}</button>
            
            {/* Smart pagination - show only relevant page numbers */}
            {(() => {
              const pages = [];
              const maxVisiblePages = 7; // Show max 7 page numbers
              
              if (totalPages <= maxVisiblePages) {
                // If total pages is small, show all
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                // Smart pagination for many pages
                if (page <= 4) {
                  // Near the beginning
                  for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                  }
                  pages.push('...');
                  pages.push(totalPages);
                } else if (page >= totalPages - 3) {
                  // Near the end
                  pages.push(1);
                  pages.push('...');
                  for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // In the middle
                  pages.push(1);
                  pages.push('...');
                  for (let i = page - 1; i <= page + 1; i++) {
                    pages.push(i);
                  }
                  pages.push('...');
                  pages.push(totalPages);
                }
              }
              
              return pages.map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${index}`} style={{ margin: '0 6px', padding: '8px 14px', color: '#888' }}>
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum as number)}
                    style={{ 
                      margin: '0 6px', 
                      padding: '8px 14px', 
                      borderRadius: 6, 
                      border: pageNum === page ? '1px solid #2563eb' : '1px solid #ddd', 
                      background: pageNum === page ? '#2563eb' : '#fff', 
                      color: pageNum === page ? '#fff' : '#2563eb', 
                      fontWeight: 'bold', 
                      cursor: 'pointer' 
                    }}
                  >
                    {pageNum}
                  </button>
                )
              ));
            })()}
            
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              style={{ margin: '0 6px', padding: '8px 14px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: page === totalPages ? '#bbb' : '#2563eb', fontWeight: 'bold', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
            >{'>'}</button>
          </div>
        </main>
      </div>
    </div>
  );
}

function getAbsoluteUrl(path: string) {
  if (typeof window === 'undefined') {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return base + path;
  }
  return path;
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
        }}>{fmt}</span>
      ))}
    </span>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const filePath = path.join(process.cwd(), 'public/data/datasets-index.json');
  const datasets = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const orgCounts: Record<string, number> = {};
  datasets.forEach((ds: any) => {
    const org = ds.organization || '';
    orgCounts[org] = (orgCounts[org] || 0) + 1;
  });
  const orgs = Object.entries(orgCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

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

  return {
    props: {
      datasets,
      orgs,
      tags,
      formats,
      licenses
    },
  };
}; 