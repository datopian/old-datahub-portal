import fs from 'fs';
import path from 'path';
import { GetStaticProps } from 'next';
import SearchBar from '../components/SearchBar';
import StatsCards from '../components/StatsCards';
import TagGrid from '../components/TagGrid';

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
  return (
    <>
      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Discover Open Data</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Search for data, and get updates from datasets and groups that you're interested in.
        </p>

        <SearchBar />
        <StatsCards stats={stats} />
        <TagGrid tags={popularTags} />
      </main>
    </>
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
    .slice(0, 10)
    .map(([id, count]) => ({ id, label: id }));

  return {
    props: {
      datasets,
      stats,
      popularTags
    }
  };
};
