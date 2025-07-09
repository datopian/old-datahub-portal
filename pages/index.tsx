import fs from 'fs';
import path from 'path';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface Dataset {
  id: string;
  title: string;
  description: string;
  organization: string;
  tags: string[];
}

interface Tag {
  id: string;
  label: string;
}


interface Props {
  datasets: Dataset[];
  stats: {
    datasetCount: number;
    organizationCount: number;
  };
  popularTags: Tag[];
}

export default function Home({ datasets, stats, popularTags }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/datasets?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem 3rem 1rem' }}>
        {/* Hero Section */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          minHeight: 220,
          marginTop: 36,
          marginBottom: 32,
          position: 'relative',
        }}>
          <h1 style={{
            fontSize: '2.6rem',
            fontWeight: 900,
            margin: 0,
            color: '#222',
            letterSpacing: '-1px',
            textAlign: 'left',
            lineHeight: 1.1,
          }}>
            Discover Open Data
          </h1>
          <p style={{
            color: '#444',
            fontSize: '1.18rem',
            margin: '1.2rem 0 2.2rem 0',
            maxWidth: 540,
            textAlign: 'left',
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            Search for data, and get updates from datasets and groups that you're interested in.
          </p>
          <form onSubmit={handleSearch} style={{ width: '100%', margin: '0', display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f6f6f6',
              border: '1.5px solid #e0e0e0',
              borderRadius: 12,
              overflow: 'hidden',
              paddingLeft: 16,
              transition: 'box-shadow 0.2s',
              width: '100%',
            }}>
              <input
                type="text"
                placeholder="Find datasets by keyword, topic, or publisher"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '1.1rem 1.2rem',
                  fontSize: '1.13rem',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#222',
                  fontWeight: 500
                }}
              />
              <span style={{ color: '#bbb', fontSize: '1.4rem', marginRight: 16, display: 'flex', alignItems: 'center' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><circle cx="10" cy="10" r="8" stroke="#bbb" strokeWidth="2"/><path d="M18 18L15 15" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
            </div>
          </form>
        </section>

        <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#222', margin: '0 0 18px 0', letterSpacing: '-0.5px', textAlign: 'left' }}>Portal Stats</h2>
        {/* Stats */}
        <section style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '2.5rem',
          margin: '0 0 2.5rem 0',
          flexWrap: 'nowrap',
        }}>
          <div
            onClick={() => router.push('/datasets')}
            style={{
              flex: 1,
              background: '#fdfaf7',
              border: '1.5px solid #f3f3f3',
              borderRadius: 16,
              boxShadow: '0 2px 12px #ff572208',
              padding: '2.2rem 2.2rem',
              textAlign: 'left',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              position: 'relative',
              overflow: 'hidden',
              minWidth: 0,
              minHeight: 140,
              cursor: 'pointer',
              transition: 'box-shadow 0.2s, border 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.boxShadow = '0 4px 24px #ff572233';
              e.currentTarget.style.border = '1.5px solid #ff5722';
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = '0 2px 12px #ff572208';
              e.currentTarget.style.border = '1.5px solid #f3f3f3';
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: '#ff5722',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 18,
              color: '#fff', boxShadow: '0 2px 8px #ff572233', flexShrink: 0
            }}>
              <img src="/icons/visualization.png" alt="Datasets" width={28} height={28} style={{display:'block'}} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#222', letterSpacing: '-1px', marginBottom: 6 }}>Datasets</div>
            <div style={{ color: '#bbb', fontSize: '1.08rem', fontWeight: 500 }}>{stats.datasetCount.toLocaleString()} available</div>
          </div>
          <div
            onClick={() => router.push('/organizations')}
            style={{
              flex: 1,
              background: '#fdfaf7',
              border: '1.5px solid #f3f3f3',
              borderRadius: 16,
              boxShadow: '0 2px 12px #ff572208',
              padding: '2.2rem 2.2rem',
              textAlign: 'left',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              position: 'relative',
              overflow: 'hidden',
              minWidth: 0,
              minHeight: 140,
              cursor: 'pointer',
              transition: 'box-shadow 0.2s, border 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.boxShadow = '0 4px 24px #ff572233';
              e.currentTarget.style.border = '1.5px solid #ff5722';
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = '0 2px 12px #ff572208';
              e.currentTarget.style.border = '1.5px solid #f3f3f3';
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: '#ff5722',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 18,
              color: '#fff', boxShadow: '0 2px 8px #ff572233', flexShrink: 0
            }}>
              <img src="/icons/old-building.png" alt="Organizations" width={28} height={28} style={{display:'block'}} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#222', letterSpacing: '-1px', marginBottom: 6 }}>Organizations</div>
            <div style={{ color: '#bbb', fontSize: '1.08rem', fontWeight: 500 }}>{stats.organizationCount.toLocaleString()} publishers</div>
          </div>
        </section>

        {/* Popular Tags */}
        <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#222', margin: '0 0 18px 0', letterSpacing: '-0.5px', textAlign: 'left' }}>Browse by Popular Tags</h2>
        <section style={{ margin: '0 0 3.5rem 0', maxWidth: 1200 }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.2rem',
            justifyContent: 'flex-start',
          }}>
            {(() => {
              const order = [
                'lod',
                'format-rdf',
                'publications',
                'senegal',
                'ansd',
                'donnees',
                'menages',
                'published-by-third-party',
              ];
              const tagsSorted = [...popularTags].sort((a, b) => {
                const ia = order.indexOf(a.label.toLowerCase());
                const ib = order.indexOf(b.label.toLowerCase());
                if (ia === -1 && ib === -1) return 0;
                if (ia === -1) return 1;
                if (ib === -1) return -1;
                return ia - ib;
              });
              return tagsSorted.map((tag, i) => {
                let iconSrc = "/icons/visualization.png";
                if (tag.label.toLowerCase().includes('lod')) iconSrc = "/icons/link.png";
                else if (tag.label.toLowerCase().includes('format')) iconSrc = "/icons/left-and-right.png";
                else if (tag.label.toLowerCase().includes('publications')) iconSrc = "/icons/document.png";
                else if (tag.label.toLowerCase().includes('senegal')) iconSrc = "/icons/globe-earth.png";
                else if (tag.label.toLowerCase().includes('ansd')) iconSrc = "/icons/graph.png";
                else if (tag.label.toLowerCase().includes('donnees')) iconSrc = "/icons/visualization.png";
                else if (tag.label.toLowerCase().includes('menages')) iconSrc = "/icons/home.png";
                else if (tag.label.toLowerCase().includes('published')) iconSrc = "/icons/people.png";
                return (
                  <div key={tag.id} style={{
                    background: '#fdfaf7',
                    border: '1.5px solid #f3f3f3',
                    borderRadius: 16,
                    boxShadow: '0 2px 12px #ff572208',
                    padding: '1.2rem 1.2rem 1.2rem 1.2rem',
                    minWidth: 276,
                    maxWidth: 276,
                    flex: '1 1 276px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: '#ff5722',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', marginBottom: 10,
                      color: '#fff', boxShadow: '0 2px 8px #ff572233'
                    }}>
                      <img src={iconSrc} alt={tag.label} width={22} height={22} style={{display:'block'}} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.08rem', color: '#222', marginBottom: 2 }}>{tag.label}</div>
                    <div style={{ color: '#888', fontSize: '0.98rem', marginBottom: 10 }}>
                      {(() => {
                        const l = tag.label.toLowerCase();
                        if (l === 'lod') return 'Linked open data resources.';
                        if (l === 'format-rdf') return 'RDF formatted datasets.';
                        if (l === 'publications') return 'Research and official publications.';
                        if (l === 'senegal') return 'Data related to Senegal.';
                        if (l === 'ansd') return 'National statistics from ANSD.';
                        if (l === 'donnees') return 'General data collections.';
                        if (l === 'menages') return 'Household survey data.';
                        if (l === 'published-by-third-party') return 'Datasets from third parties.';
                        return 'Popular open data topic.';
                      })()}
                    </div>
                    <button
                      style={{
                        background: '#ff5722',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0.5rem 1.2rem',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        marginTop: 'auto',
                        boxShadow: '0 2px 8px #ff572233',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => {
                        window.location.href = `/datasets?tag=${encodeURIComponent(tag.id)}`;
                      }}
                    >View</button>
                  </div>
                );
              });
            })()}
          </div>
        </section>

      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const datasetsFilePath = path.join(process.cwd(), 'datasets-index.json');
  const orgsFilePath = path.join(process.cwd(), 'organizations-index.json');
  const datasets = JSON.parse(fs.readFileSync(datasetsFilePath, 'utf-8'));
  let orgIndex = [];
  try {
    orgIndex = JSON.parse(fs.readFileSync(orgsFilePath, 'utf-8'));
  } catch (e) {
    orgIndex = [];
  }

  const stats = {
    datasetCount: datasets.length,
    organizationCount: orgIndex.length
  };

  const tagCounts: Record<string, number> = {};
  datasets.forEach((ds: any) => {
    (ds.tags || []).forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const popularTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, count]) => ({ id, label: id }));

  return {
    props: {
      datasets,
      stats,
      popularTags
    }
  };
}; 