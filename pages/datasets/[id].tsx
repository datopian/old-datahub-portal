import fs from 'fs';
import path from 'path';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';

interface License {
  name: string;
  title: string;
  path: string;
}
interface Source {
  title: string;
  path: string;
}
interface Contributor {
  title: string;
  role?: string;
}
interface Organization {
  name: string;
  title?: string;
}
interface Resource {
  name: string;
  description?: string;
  format?: string;
  path: string;
}
interface DatasetDetail {
  name: string;
  title: string;
  description: string;
  version?: string;
  licenses?: License[];
  keywords?: string[];
  sources?: Source[];
  contributors?: Contributor[];
  created?: string;
  modified?: string;
  organization?: Organization;
  resources: Resource[];
}

interface Props {
  dataset: DatasetDetail | null;
}

export default function DatasetDetailPage({ dataset }: Props) {
  if (!dataset) {
    return <div style={{ padding: 32 }}>Dataset not found.</div>;
  }
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <Link href="/datasets">← Back to Datasets</Link>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>{dataset.title}</h1>
      <p style={{ color: '#666' }}>{dataset.description}</p>
      {dataset.organization && (
        <div style={{ fontSize: '1rem', color: '#888', marginBottom: 8 }}>
          Organization: {dataset.organization.title || dataset.organization.name}
        </div>
      )}
      {dataset.version && (
        <div style={{ fontSize: '1rem', color: '#888', marginBottom: 8 }}>
          Version: {dataset.version}
        </div>
      )}
      {dataset.created && (
        <div style={{ fontSize: '1rem', color: '#888', marginBottom: 8 }}>
          Created: {new Date(dataset.created).toLocaleDateString()}
        </div>
      )}
      {dataset.modified && (
        <div style={{ fontSize: '1rem', color: '#888', marginBottom: 8 }}>
          Modified: {new Date(dataset.modified).toLocaleDateString()}
        </div>
      )}
      {dataset.keywords && dataset.keywords.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {dataset.keywords.map(tag => (
            <span key={tag} style={{ background: '#f2f2f2', borderRadius: 4, padding: '2px 8px', marginRight: 6, fontSize: '0.95rem' }}>{tag}</span>
          ))}
        </div>
      )}
      {dataset.licenses && dataset.licenses.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <b>License:</b> {dataset.licenses.map(lic => (
            <span key={lic.name} style={{ marginRight: 8 }}>
              <a href={lic.path} target="_blank" rel="noopener noreferrer">{lic.title || lic.name}</a>
            </span>
          ))}
        </div>
      )}
      {dataset.sources && dataset.sources.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <b>Sources:</b> {dataset.sources.map(src => (
            <span key={src.title} style={{ marginRight: 8 }}>
              <a href={src.path} target="_blank" rel="noopener noreferrer">{src.title}</a>
            </span>
          ))}
        </div>
      )}
      {dataset.contributors && dataset.contributors.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <b>Contributors:</b> {dataset.contributors.map(c => (
            <span key={c.title} style={{ marginRight: 8 }}>{c.title}{c.role ? ` (${c.role})` : ''}</span>
          ))}
        </div>
      )}
      {dataset.resources && dataset.resources.length > 0 && (
        <div>
          <h3>Resources</h3>
          <ul>
            {dataset.resources.map(res => (
              <li key={res.name} style={{ marginBottom: 8 }}>
                <a href={res.path} target="_blank" rel="noopener noreferrer">{res.name}</a>
                {res.format && <span style={{ marginLeft: 8, color: '#888' }}>({res.format})</span>}
                {res.description && <div style={{ fontSize: '0.95rem', color: '#666' }}>{res.description}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const indexPath = path.join(process.cwd(), 'public/data/datasets-index.json');
  let datasets = [];
  try {
    const raw = fs.readFileSync(indexPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      datasets = parsed;
    }
  } catch (e) {
    datasets = [];
  }
  const paths = datasets.map((ds: any) => ({ params: { id: ds.id } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params as { id: string };
  const indexPath = path.join(process.cwd(), 'public/data/datasets-index.json');
  let datasets = [];
  try {
    const raw = fs.readFileSync(indexPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      datasets = parsed;
    }
  } catch (e) {
    datasets = [];
  }
  const entry = datasets.find((ds: any) => ds.id === id);
  let dataset = null;
  if (entry && entry.path) {
    const dpPath = path.join(process.cwd(), 'public/data', entry.path);
    try {
      const raw = fs.readFileSync(dpPath, 'utf-8');
      dataset = JSON.parse(raw);
    } catch (e) {
      dataset = null;
    }
  }
  return { props: { dataset } };
};
