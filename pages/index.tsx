import fs from 'fs';
import path from 'path';
import { GetStaticProps } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import StatsCards from '../components/StatsCards';
import TagGrid from '../components/TagGrid';

interface Dataset {
  name: string;
  title: string;
  notes: string;
  organization: string;
  tags: string[];
  resources: any[];
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
      <Header />

      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Discover Open Data</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Search for data, and get updates from datasets and groups that you're interested in.
        </p>

        <SearchBar />
        <StatsCards stats={stats} />
        <TagGrid tags={popularTags} />
      </main>

      <Footer />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const filePath = path.join(process.cwd(), 'public/data/datasets.json');
  const datasets = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const stats = {
    datasetCount: 12430,
    organizationCount: 1120
  };

  const popularTags = [
    { id: 'lod', label: 'Linked open data resources.' },
    { id: 'format-rdf', label: 'RDF formatted datasets.' },
    { id: 'publications', label: 'Research and official publications.' },
    { id: 'Senegal', label: 'Data related to Senegal.' },
    { id: 'ANSD', label: 'National statistics from ANSD.' },
    { id: 'donnees', label: 'General data collections.' },
    { id: 'menages', label: 'Household survey data.' },
    { id: 'published-by-third-party', label: 'Datasets from third parties.' }
  ];

  return {
    props: {
      datasets,
      stats,
      popularTags
    }
  };
};
