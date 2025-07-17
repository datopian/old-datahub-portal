import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import OrganizationLayout from '@/components/_shared/OrganizationLayout';
import React from 'react';

interface Organization {
  id: string;
  name: string;
  title: string;
  description: string;
  image_url?: string;
  created?: string;
  num_followers?: number;
  package_count?: number;
  extras?: { key: string; value: string }[];
  path?: string;
  packages?: number;
}

interface Props {
  organization: Organization | null;
}

function renderMarkdownLinks(text: string) {
  if (!text) return null;
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<a key={match[2] + match.index} href={match[2]} target="_blank" rel="noopener noreferrer" style={{ color: '#ff5722', textDecoration: 'underline' }}>{match[1]}</a>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default function OrganizationAboutPage({ organization }: Props) {
  const [details, setDetails] = React.useState<Organization | null>(organization);
  React.useEffect(() => {
    if (organization && organization.path) {
      fetch(`/${organization.path}`)
        .then(res => res.json())
        .then(setDetails)
        .catch(() => setDetails(organization));
    }
  }, [organization]);
  if (!organization) return <div>Organization not found</div>;
  return (
    <OrganizationLayout
      organization={organization}
      tags={[]}
      formats={[]}
      licenses={[]}
      activeTab="about"
    >
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 800, margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: 16, color: '#ff5722' }}>About {details?.title || organization.title}</h3>
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: 8, color: '#333' }}>Description</h4>
          <p style={{ color: '#666', lineHeight: 1.6 }}>
            {renderMarkdownLinks(details?.description || organization.description || 'No description available for this organization.')}
          </p>
        </div>
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: 8, color: '#333' }}>Statistics</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff5722' }}>{details?.num_followers ?? 0}</div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Followers</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff5722' }}>{organization.packages ?? 0}</div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Datasets</div>
            </div>
            {details?.created && (
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff5722' }}>{new Date(details.created).getFullYear()}</div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Created</div>
              </div>
            )}
          </div>
        </div>
        {details?.extras && details.extras.length > 0 && (
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: 8, color: '#333' }}>Additional Information</h4>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
              {details.extras.map((extra, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <strong style={{ color: '#333' }}>{extra.key}:</strong> {extra.value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </OrganizationLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const orgsPath = path.join(process.cwd(), 'organizations-index.json');
  const orgs = JSON.parse(fs.readFileSync(orgsPath, 'utf-8'));
  const paths = orgs.map((org: any) => ({ params: { name: org.name } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const name = context.params?.name as string;
  const orgsIndexPath = path.join(process.cwd(), 'organizations-index.json');
  let organizations = [];
  try {
    const raw = fs.readFileSync(orgsIndexPath, 'utf-8');
    organizations = JSON.parse(raw);
  } catch (e) {
    organizations = [];
  }
  const organization = organizations.find((org: any) => org.name === name) || null;
  return { props: { organization } };
}; 