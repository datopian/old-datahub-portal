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
}

interface Props {
  datasets: DatasetIndexEntry[];
}

export default function DatasetListPage({ datasets }: Props) {
  const safeDatasets = Array.isArray(datasets) ? datasets : [];
  const [query, setQuery] = useState('');

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

  const filtered = useMemo(() => {
    if (!query) return safeDatasets;
    try {
      const results = idx.search(`*${query}*`);
      return results.map((r: any) => idMap[r.ref]).filter(Boolean);
    } catch {
      return [];
    }
  }, [query, idx, idMap, safeDatasets]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Datasets</h1>
      <input
        type="text"
        placeholder="Search datasets..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 24, fontSize: '1rem' }}
      />
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filtered.map(ds => (
          <li key={ds.id} style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>
              <Link href={`/datasets/${ds.id}`}>{ds.title}</Link>
            </h2>
            <p style={{ color: '#666' }}>{ds.description}</p>
            <div style={{ fontSize: '0.95rem', color: '#888' }}>Organization: {ds.organization}</div>
            <div style={{ marginTop: 4 }}>
              {ds.tags.map(tag => (
                <span key={tag} style={{ background: '#f2f2f2', borderRadius: 4, padding: '2px 8px', marginRight: 6, fontSize: '0.85rem' }}>{tag}</span>
              ))}
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li>No datasets found.</li>}
      </ul>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const filePath = path.join(process.cwd(), 'public/data/datasets-index.json');
  let datasets = [];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      datasets = parsed;
    }
  } catch (e) {
    datasets = [];
  }
  return {
    props: {
      datasets,
    },
  };
}; 