import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import { useRouter } from 'next/router';
import OrganizationLayout from '@/components/_shared/OrganizationLayout';
import { format } from 'timeago.js';

interface ActivityStreamEntry {
  user_id: string;
  timestamp: string;
  object_id: string;
  revision_id: string;
  data: any;
  id: string;
  activity_type: string;
  user: { id: string; display_name: string; name: string };
}

interface Organization {
  id: string;
  name: string;
  title: string;
  description: string;
  image_url?: string;
}

interface Props {
  organization: Organization | null;
  activityStream: ActivityStreamEntry[];
  page: number;
  totalPages: number;
}

export default function OrganizationActivityPage({ organization, activityStream }: Props) {
  if (!organization) return <div>Organization not found</div>;
  return (
    <OrganizationLayout
      organization={organization}
      tags={[]}
      formats={[]}
      licenses={[]}
      activeTab="activity"
    >
      <div>
        <h2 style={{ color: '#ff5722', marginBottom: 24 }}>Activity Stream</h2>
        <div style={{ borderLeft: '3px solid #ff5722', marginLeft: 8, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {activityStream.length === 0 ? (
            <div style={{ color: '#888' }}>No activity found for this organization.</div>
          ) : (
            activityStream.map((act, i) => (
              <div key={act.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 22, color: '#ff5722', marginTop: 2 }}>
                  {(act.user && act.user.display_name && act.user.display_name !== act.user.id)
                    ? act.user.display_name[0].toUpperCase()
                    : (act.user && act.user.id ? act.user.id[0] : '?')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#ff5722', fontSize: '1.08rem' }}>
                    {act.user?.display_name || act.user_id} {act.activity_type.replace(/_/g, ' ')}{' '}
                    {act.data?.package?.title ? (
                      <a href={`/dataset/${act.data.package.name}`} style={{ color: '#ff5722', textDecoration: 'underline' }}>{act.data.package.title}</a>
                    ) : null}
                  </div>
                  <div style={{ color: '#888', fontSize: '0.98rem' }}>{format(act.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </OrganizationLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const orgsDir = path.join(process.cwd(), 'public/data/organizations.json');
  const orgs = JSON.parse(fs.readFileSync(orgsDir, 'utf-8'));
  const paths: any[] = [];
  for (const org of orgs) {
    paths.push({ params: { name: org.name, page: '0' } });
  }
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const name = context.params?.name as string;
  const orgPath = path.join(process.cwd(), 'datasets', name, 'organization.json');
  let organization = null;
  if (fs.existsSync(orgPath)) {
    organization = JSON.parse(fs.readFileSync(orgPath, 'utf-8'));
  }
  let activityStream: ActivityStreamEntry[] = [];
  if (organization) {
    const activityPath = path.join(process.cwd(), 'datasets', name, 'activity_stream.json');
    if (fs.existsSync(activityPath)) {
      activityStream = JSON.parse(fs.readFileSync(activityPath, 'utf-8'));
    }
  }
  return { props: { organization, activityStream } };
}; 