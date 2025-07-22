import styles from '../../../styles/DatasetDetailPage.module.css';
import Breadcrumbs from '@/components/_shared/Breadcrumbs';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export interface License {
  name: string;
  title: string;
  path: string;
}
export interface Source {
  title: string;
  path: string;
}
export interface Contributor {
  title: string;
  role?: string;
}
export interface Organization {
  name: string;
  title?: string;
  logo?: string;
  description?: string;
  socials?: { name: string; url: string }[];
}
export interface Resource {
  name: string;
  description?: string;
  format?: string;
  path: string;
  url?: string;
}
export interface DatasetDetail {
  name: string;
  title: string;
  description: string;
  version?: string;
  licenses?: License[];
  keywords?: string[];
  tags?: any[];
  sources?: Source[];
  contributors?: Contributor[];
  created?: string;
  modified?: string;
  organization?: Organization;
  resources: Resource[];
}

export interface DatasetDetailPageProps {
  dataset?: DatasetDetail | null;
  activityStream?: any[];
  datasetPath?: string | null;
  id?: string;
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

export default function DatasetDetailPage({ dataset: initialDataset, activityStream = [], datasetPath, id }: DatasetDetailPageProps) {
  const router = useRouter();
  const [dataset, setDataset] = useState<DatasetDetail | null | undefined>(initialDataset);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dataset && datasetPath) {
      setLoading(true);
      setError(null);
      fetch(`/${datasetPath}`)
        .then(res => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then(data => {
          setDataset(data);
          setLoading(false);
        })
        .catch(() => {
          setError('Dataset not found.');
          setLoading(false);
        });
    }
  }, [dataset, datasetPath]);

  const datasetName = dataset?.name || id;
  let tab: 'dataset' | 'groups' | 'activity' = 'dataset';
  if (router.asPath.startsWith(`/dataset/groups/`)) tab = 'groups';
  if (router.asPath.startsWith(`/dataset/activity/`)) tab = 'activity';
  if (loading) {
    return (
      <div style={{ padding: 32 }}>
        <div>Loading…</div>
      </div>
    );
  }
  if (!dataset || error) {
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

  // Ensure tags is always present and is an array of objects with name/display_name
  const tags = Array.isArray(dataset.tags) ? dataset.tags.filter(tag => tag && (tag.name || tag.display_name)) : [];
  // DEBUG: Вывести теги в консоль
  if (typeof window !== 'undefined') {
    console.log('Dataset tags:', tags);
  }

  return (
    <div className={styles.pageBg}>
      <div style={{ margin: '-22px 0 12px 0' }}>
        <Breadcrumbs items={[
          { label: 'Datasets', href: '/dataset' },
          { label: dataset.title }
        ]} />
        <div style={{ borderBottom: '1px solid #e5e7eb', marginTop: 12 }} />
      </div>
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <h1 style={{ fontSize: '2rem', margin: 0, color: '#ff5722', marginBottom: 10 }}>{dataset.title}</h1>
          <div className={styles.tabRow}>
            <button onClick={() => router.push(`/dataset/${datasetName}`)} style={{ padding: '8px 18px', border: 'none', borderBottom: tab === 'dataset' ? '3px solid #ff5722' : '3px solid transparent', background: 'none', fontWeight: tab === 'dataset' ? 'bold' : 'normal', color: tab === 'dataset' ? '#ff5722' : '#222', fontSize: '1.1rem', cursor: 'pointer' }}>Dataset</button>
            <button onClick={() => router.push(`/dataset/groups/${datasetName}`)} style={{ padding: '8px 18px', border: 'none', borderBottom: tab === 'groups' ? '3px solid #ff5722' : '3px solid transparent', background: 'none', fontWeight: tab === 'groups' ? 'bold' : 'normal', color: tab === 'groups' ? '#ff5722' : '#222', fontSize: '1.1rem', cursor: 'pointer' }}>Groups</button>
            <button onClick={() => router.push(`/dataset/activity/${datasetName}`)} style={{ padding: '8px 18px', border: 'none', borderBottom: tab === 'activity' ? '3px solid #ff5722' : '3px solid transparent', background: 'none', fontWeight: tab === 'activity' ? 'bold' : 'normal', color: tab === 'activity' ? '#ff5722' : '#222', fontSize: '1.1rem', cursor: 'pointer' }}>Activity Stream</button>
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
                        <div style={{ fontWeight: 'bold', fontSize: '1.08rem', color: '#ff5722' }}>{res.name}</div>
                        <div style={{ color: '#666', fontSize: '0.98rem', marginBottom: 4 }}>{res.description}</div>
                        <span style={{ background: '#ff5722', color: '#fff', borderRadius: 4, padding: '2px 10px', fontWeight: 'bold', fontSize: '0.97rem', marginRight: 8 }}>{res.format}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <a href={res.url || res.path} target="_blank" rel="noopener noreferrer" style={{ background: '#fff', color: '#ff5722', border: '1px solid #ff5722', borderRadius: 6, padding: '7px 16px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem' }}>Go to resource</a>
                        <button style={{ background: '#ff5722', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>More info</button>
                      </div>
                    </div>
                  )) : <div>No resources found.</div>}
                </div>
              </section>
              <section style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Tags</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {tags.length === 0 ? <span style={{ color: '#888' }}>No tags</span> : tags.map((tag: any) => (
                    <button key={tag.name} style={{ background: '#fff3e6', color: '#ff5722', border: 'none', borderRadius: 6, padding: '5px 14px', fontWeight: 'bold', fontSize: '0.98rem', cursor: 'pointer' }}>{tag.display_name || tag.name}</button>
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
            <section style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 18 }}>Activity Stream</h3>
              {activityStream.length === 0 ? (
                <div style={{ color: '#888', fontSize: '1.05rem' }}>No activity found for this dataset.</div>
              ) : (
                <div style={{ borderLeft: '3px solid #ff5722', marginLeft: 8, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {activityStream.map((act, i) => (
                    <div key={act.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 22, color: '#2563eb', marginTop: 2 }}>
                        {(act.user && act.user.display_name && act.user.display_name !== act.user.id)
                          ? act.user.display_name[0].toUpperCase()
                          : (act.user && act.user.id ? act.user.id[0] : '?')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '1.08rem' }}>{getActivityMessage(act)}</div>
                        <div style={{ color: '#888', fontSize: '0.98rem' }}>{timeAgo(act.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
        <aside className={styles.sidebar}>
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
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#ff5722', textDecoration: 'none', fontWeight: 'bold', fontSize: 18 }}>{s.name}</a>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginBottom: 0 }}>
            <b>License:</b> <span style={{ color: '#ff5722' }}>{license}</span>
          </div>
        </aside>
      </div>
    </div>
  );
} 