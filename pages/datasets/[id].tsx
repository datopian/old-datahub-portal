import fs from 'fs';
import path from 'path';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';

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
  logo?: string;
  description?: string;
  socials?: { name: string; url: string }[];
}
interface Resource {
  name: string;
  description?: string;
  format?: string;
  path: string;
  url?: string;
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

const ORG_PLACEHOLDER = {
  logo: '/images/logos/DefaultOrgLogo.svg',
  description: 'No description provided.',
  socials: [
    { name: 'Google+', url: '#' },
    { name: 'Twitter', url: '#' },
    { name: 'Facebook', url: '#' },
  ],
};

export default function DatasetDetailPage({ dataset }: Props) {
  const [tab, setTab] = useState<'dataset' | 'groups' | 'activity'>('dataset');
  if (!dataset) {
    return (
      <div style={{ padding: 32 }}>
        <div>Dataset not found.</div>
      </div>
    );
  }
  const org = dataset.organization || { name: 'Unknown' };
  const isOrgString = typeof org === 'string';
  const orgLogo = isOrgString ? null : (org.logo || ORG_PLACEHOLDER.logo);
  const orgDesc = isOrgString ? null : (org.description || ORG_PLACEHOLDER.description);
  const orgSocials = isOrgString ? ORG_PLACEHOLDER.socials : (org.socials || ORG_PLACEHOLDER.socials);
  const orgTitle = isOrgString ? org : (org.title || org.name);
  const license = (dataset.licenses && dataset.licenses[0]) ? (dataset.licenses[0].title || dataset.licenses[0].name) : 'Not specified';
  const downloadUrl = `/data/datasets/${org.name?.toLowerCase() || 'unknown'}/${dataset.name}/datapackage.json`;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem', display: 'flex', gap: 32 }}>
      {/* Left column: Organization */}
      <aside style={{ width: 320, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 28, height: 'fit-content' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          {orgLogo && <img src={orgLogo} alt={orgTitle} style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 10 }} />}
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{orgTitle}</h2>
        </div>
        {orgDesc && <div style={{ color: '#666', fontSize: '1rem', marginBottom: 16 }}>{orgDesc}</div>}
        {orgSocials && (
          <div style={{ marginBottom: 16 }}>
            <b>Socials:</b>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              {orgSocials.map((s: any) => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', fontSize: 18 }}>{s.name}</a>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginBottom: 0 }}>
          <b>License:</b> <span style={{ color: '#2563eb' }}>{license}</span>
        </div>
      </aside>
      {/* Right column: Dataset */}
      <main style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 18 }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>{dataset.title}</h1>
          <div style={{ display: 'flex', gap: 0 }}>
            <button onClick={() => setTab('dataset')} style={{ padding: '8px 18px', border: 'none', borderBottom: tab === 'dataset' ? '3px solid #2563eb' : '3px solid transparent', background: 'none', fontWeight: tab === 'dataset' ? 'bold' : 'normal', color: tab === 'dataset' ? '#2563eb' : '#222', fontSize: '1.1rem', cursor: 'pointer' }}>Dataset</button>
            <button onClick={() => setTab('groups')} style={{ padding: '8px 18px', border: 'none', borderBottom: tab === 'groups' ? '3px solid #2563eb' : '3px solid transparent', background: 'none', fontWeight: tab === 'groups' ? 'bold' : 'normal', color: tab === 'groups' ? '#2563eb' : '#222', fontSize: '1.1rem', cursor: 'pointer' }}>Groups</button>
            <button onClick={() => setTab('activity')} style={{ padding: '8px 18px', border: 'none', borderBottom: tab === 'activity' ? '3px solid #2563eb' : '3px solid transparent', background: 'none', fontWeight: tab === 'activity' ? 'bold' : 'normal', color: tab === 'activity' ? '#2563eb' : '#222', fontSize: '1.1rem', cursor: 'pointer' }}>Activity Stream</button>
          </div>
        </div>
        {tab === 'dataset' && (
          <>
            <div style={{ color: '#666', fontSize: '1.1rem', marginBottom: 18 }}>{dataset.description}</div>
            <section style={{ margin: '32px 0 24px 0' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 12 }}>Data and Resources</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {dataset.resources && dataset.resources.length > 0 ? dataset.resources.map(res => (
                  <div key={res.name} style={{ background: '#f3f4f6', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.08rem', color: '#1d4ed8' }}>{res.name}</div>
                      <div style={{ color: '#666', fontSize: '0.98rem', marginBottom: 4 }}>{res.description}</div>
                      <span style={{ background: '#2563eb', color: '#fff', borderRadius: 4, padding: '2px 10px', fontWeight: 'bold', fontSize: '0.97rem', marginRight: 8 }}>{res.format}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <a href={res.url || res.path} target="_blank" rel="noopener noreferrer" style={{ background: '#fff', color: '#2563eb', border: '1px solid #2563eb', borderRadius: 6, padding: '7px 16px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem' }}>Go to resource</a>
                      <button style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>More info</button>
                    </div>
                  </div>
                )) : <div>No resources found.</div>}
              </div>
            </section>
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Tags</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(dataset.keywords || []).map(tag => (
                  <button key={tag} style={{ background: '#e0e7ff', color: '#2563eb', border: 'none', borderRadius: 6, padding: '5px 14px', fontWeight: 'bold', fontSize: '0.98rem', cursor: 'pointer' }}>{tag}</button>
                ))}
              </div>
            </section>
            <section>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Additional Info</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f9fafb', borderRadius: 8 }}>
                <tbody>
                  <tr><td style={{ fontWeight: 'bold', padding: 8, width: 160 }}>Source</td><td style={{ padding: 8 }}>{dataset.sources && dataset.sources[0] ? <a href={dataset.sources[0].path} target="_blank" rel="noopener noreferrer">{dataset.sources[0].title}</a> : '—'}</td></tr>
                  <tr><td style={{ fontWeight: 'bold', padding: 8 }}>Author</td><td style={{ padding: 8 }}>{orgTitle}</td></tr>
                  <tr><td style={{ fontWeight: 'bold', padding: 8 }}>Maintainer</td><td style={{ padding: 8 }}>{dataset.contributors && dataset.contributors[0] ? dataset.contributors[0].title : '—'}</td></tr>
                  <tr><td style={{ fontWeight: 'bold', padding: 8 }}>Version</td><td style={{ padding: 8 }}>{dataset.version || '—'}</td></tr>
                  <tr><td style={{ fontWeight: 'bold', padding: 8 }}>Last Updated</td><td style={{ padding: 8 }}>{dataset.modified ? new Date(dataset.modified).toLocaleString('en-GB', { timeZone: 'UTC', year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' UTC' : '—'}</td></tr>
                  <tr><td style={{ fontWeight: 'bold', padding: 8 }}>Created</td><td style={{ padding: 8 }}>{dataset.created ? new Date(dataset.created).toLocaleString('en-GB', { timeZone: 'UTC', year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' UTC' : '—'}</td></tr>
                </tbody>
              </table>
            </section>
          </>
        )}
        {tab === 'groups' && (
          <div style={{ color: '#888', fontSize: '1.1rem', marginTop: 32 }}>No groups info.</div>
        )}
        {tab === 'activity' && (
          <div style={{ color: '#888', fontSize: '1.1rem', marginTop: 32 }}>No activity stream.</div>
        )}
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const indexPath = path.join(process.cwd(), 'datasets-index.json');
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
  const indexPath = path.join(process.cwd(), 'datasets-index.json');
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
    const dpPath = path.join(process.cwd(), entry.path);
    try {
      const raw = fs.readFileSync(dpPath, 'utf-8');
      dataset = JSON.parse(raw);
    } catch (e) {
      dataset = null;
    }
  }
  return { props: { dataset } };
};
