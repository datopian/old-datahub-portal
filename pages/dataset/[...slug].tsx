import DatasetDetailPage from './[id]';
import fs from 'fs';
import path from 'path';

export default DatasetDetailPage;

export async function getStaticPaths() {
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
  const paths = datasets.flatMap((ds) => [
    { params: { slug: [ds.id] } },
    { params: { slug: ['groups', ds.id] } },
    { params: { slug: ['activity', ds.id] } },
  ]);
  return { paths, fallback: false };
}

export async function getStaticProps(context) {
  const slug = context.params?.slug;
  let id = '';
  if (Array.isArray(slug)) {
    id = slug[slug.length - 1];
  } else if (typeof slug === 'string') {
    id = slug;
  }
  // Reuse logic from [id].tsx
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
  const entry = datasets.find((ds) => ds.id === id);
  let dataset = null;
  let activityStream = [];
  if (entry && entry.path) {
    const dpPath = path.join(process.cwd(), entry.path);
    try {
      const raw = fs.readFileSync(dpPath, 'utf-8');
      dataset = JSON.parse(raw);
    } catch (e) {
      dataset = null;
    }
    const activityPath = path.join(path.dirname(dpPath), 'activity_stream.json');
    if (fs.existsSync(activityPath)) {
      try {
        const raw = fs.readFileSync(activityPath, 'utf-8');
        activityStream = JSON.parse(raw);
      } catch (e) {
        activityStream = [];
      }
    }
  }
  return { props: { dataset, activityStream } };
} 