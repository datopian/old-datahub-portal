import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import { useRouter } from 'next/router';
import OrganizationLayout from '@/components/_shared/OrganizationLayout';
import { format } from 'timeago.js';
import React from 'react';

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
  activity_stream_path?: string;
}

interface Props {
  organization: Organization | null;
  activityStream: ActivityStreamEntry[];
  page: number;
  totalPages: number;
}

export default function OrganizationActivityPage({ organization }: Props) {
  const [activityStream, setActivityStream] = React.useState<ActivityStreamEntry[]>([]);
  React.useEffect(() => {
    if (organization && organization.activity_stream_path) {
      fetch(`/${organization.activity_stream_path}`)
        .then(res => res.json())
        .then(setActivityStream)
        .catch(() => setActivityStream([]));
    }
  }, [organization]);
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

export const getServerSideProps = async (context) => {
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
  let activityStream = [];
  if (organization && organization.activity_stream_path) {
    const activityPath = path.join(process.cwd(), organization.activity_stream_path);
    if (fs.existsSync(activityPath)) {
      activityStream = JSON.parse(fs.readFileSync(activityPath, 'utf-8'));
    }
  }
  return { props: { organization, activityStream } };
}; 