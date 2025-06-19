import fs from 'fs';
import path from 'path';
import { GetStaticPaths, GetStaticProps } from 'next';

export default function DatasetPage({ dataset }: { dataset: any }) {
  if (!dataset) return <div>Dataset not found</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{dataset.title}</h1>
      <p>{dataset.notes}</p>
      <h2>Resources</h2>
      <ul>
        {dataset.resources.map((r: any) => (
          <li key={r.name}>
            <a href={r.url}>{r.name}</a> ({r.format})
          </li>
        ))}
      </ul>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const filePath = path.join(process.cwd(), 'public/data/datasets.json');
  const datasets = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const paths = datasets.map((ds: any) => ({
    params: { id: ds.name }
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const filePath = path.join(process.cwd(), 'public/data/datasets.json');
  const datasets = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const dataset = datasets.find((ds: any) => ds.name === params?.id);

  return {
    props: {
      dataset: dataset || null
    }
  };
};
