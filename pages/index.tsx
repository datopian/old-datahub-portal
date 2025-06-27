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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)' }}>
      <main style={{ maxWidth: 980, margin: '0 auto', padding: '0 1rem 3rem 1rem' }}>
        {/* Hero Section */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 420,
          marginTop: 56,
          marginBottom: 48,
          position: 'relative',
        }}>
          <div style={{
            fontSize: 80,
            marginBottom: 16,
            filter: 'drop-shadow(0 4px 24px #a5b4fc55)'
          }}>🌐</div>
          <h1 style={{
            fontSize: '3.2rem',
            fontWeight: 900,
            margin: 0,
            background: 'linear-gradient(90deg, #6366f1 20%, #06b6d4 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-2px',
            textAlign: 'center',
            lineHeight: 1.1,
            textShadow: '0 2px 16px #a5b4fc22',
          }}>
            Discover Open Data
          </h1>
          <p style={{
            color: '#334155',
            fontSize: '1.25rem',
            margin: '1.2rem 0 2.2rem 0',
            maxWidth: 540,
            textAlign: 'center',
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            Explore thousands of datasets from organizations worldwide. Find the data you need to drive insights and innovation.
          </p>
          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 700, margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#fff',
              border: '1.5px solid #e0e7ef',
              borderRadius: 16,
              boxShadow: '0 4px 32px #6366f10a',
              overflow: 'hidden',
              paddingLeft: 16,
              transition: 'box-shadow 0.2s',
            }}>
              <span style={{ color: '#a5b4fc', fontSize: '1.4rem', marginRight: 8, display: 'flex', alignItems: 'center' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><circle cx="10" cy="10" r="8" stroke="#a5b4fc" strokeWidth="2"/><path d="M18 18L15 15" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              <input
                type="text"
                placeholder="Search datasets by keyword, topic, or organization..."
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
              <button
                type="submit"
                style={{
                  padding: '1.1rem 2rem',
                  background: 'linear-gradient(90deg, #6366f1 20%, #06b6d4 80%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1.13rem',
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                  transition: 'background 0.2s',
                  borderLeft: '1.5px solid #e0e7ef',
                  borderRadius: 0,
                  boxShadow: 'none',
                }}
              >
                Search
              </button>
            </div>
          </form>
        </section>

        {/* Stats */}
        <section style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2.5rem',
          margin: '0 0 3.5rem 0',
          flexWrap: 'wrap',
        }}>
          <div style={{
            minWidth: 200,
            background: '#fff',
            border: '1.5px solid #e0e7ef',
            borderRadius: 18,
            boxShadow: '0 4px 32px #6366f10a',
            padding: '2.1rem 1.5rem',
            textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 60%, #a5b4fc 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 14,
              color: '#fff', boxShadow: '0 2px 12px #6366f133'
            }}>📈</div>
            <div style={{ fontWeight: 800, fontSize: '2rem', color: '#1a202c', letterSpacing: '-1px' }}>{stats.datasetCount.toLocaleString()}</div>
            <div style={{ color: '#6366f1', fontSize: '1.08rem', marginTop: 2, fontWeight: 600 }}>Datasets</div>
          </div>
          <div style={{
            minWidth: 200,
            background: '#fff',
            border: '1.5px solid #e0e7ef',
            borderRadius: 18,
            boxShadow: '0 4px 32px #06b6d40a',
            padding: '2.1rem 1.5rem',
            textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4 60%, #a7f3d0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 14,
              color: '#fff', boxShadow: '0 2px 12px #06b6d433'
            }}>🏛️</div>
            <div style={{ fontWeight: 800, fontSize: '2rem', color: '#1a202c', letterSpacing: '-1px' }}>{stats.organizationCount.toLocaleString()}</div>
            <div style={{ color: '#06b6d4', fontSize: '1.08rem', marginTop: 2, fontWeight: 600 }}>Organizations</div>
          </div>
        </section>

        {/* Popular Tags */}
        <section style={{ margin: '0 auto 3.5rem auto', maxWidth: 800 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: 18, letterSpacing: '-0.5px', textAlign: 'center' }}>Popular Topics</h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.8rem',
            justifyContent: 'center',
          }}>
            {popularTags.map((tag, i) => (
              <Link
                key={tag.id}
                href={`/datasets?tag=${encodeURIComponent(tag.id)}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: i % 2 === 0 ? '#f0f9ff' : '#f3f4f6',
                  border: '1.5px solid #e0e7ef',
                  borderRadius: 22,
                  padding: '0.6rem 1.3rem',
                  color: '#0e172a',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  textDecoration: 'none',
                  transition: 'background 0.15s, border 0.15s, color 0.15s',
                  boxShadow: '0 2px 8px #6366f108',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#6366f1';
                  e.currentTarget.style.border = '1.5px solid #6366f1';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = i % 2 === 0 ? '#f0f9ff' : '#f3f4f6';
                  e.currentTarget.style.border = '1.5px solid #e0e7ef';
                  e.currentTarget.style.color = '#0e172a';
                }}
              >
                {tag.id}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ margin: '0 auto', maxWidth: 600, padding: '2.5rem 1.5rem', background: '#fff', border: '1.5px solid #e0e7ef', borderRadius: 22, boxShadow: '0 4px 32px #6366f10a', textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b', marginBottom: 14 }}>Ready to explore?</div>
          <div style={{ color: '#334155', fontSize: '1.08rem', marginBottom: 28 }}>Browse all datasets or view organizations.</div>
          <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/datasets" style={{
              padding: '1.1rem 2.3rem',
              background: 'linear-gradient(90deg, #6366f1 20%, #06b6d4 80%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: '1.13rem',
              transition: 'background 0.2s',
              boxShadow: '0 2px 12px #6366f133',
              border: 'none',
              letterSpacing: '0.5px',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #06b6d4 20%, #6366f1 80%)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 20%, #06b6d4 80%)';
            }}>
              Browse Datasets
            </Link>
            <Link href="/organizations" style={{
              padding: '1.1rem 2.3rem',
              background: '#fff',
              color: '#6366f1',
              border: '2px solid #6366f1',
              textDecoration: 'none',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: '1.13rem',
              transition: 'background 0.2s, color 0.2s',
              boxShadow: '0 2px 12px #6366f108',
              letterSpacing: '0.5px',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#6366f1';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.color = '#6366f1';
            }}>
              View Organizations
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const filePath = path.join(process.cwd(), 'public/data/datasets-index.json');
  const datasets = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const stats = {
    datasetCount: datasets.length,
    organizationCount: new Set(datasets.map((d: any) => d.organization).filter(Boolean)).size
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