import React from 'react';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: '40px 32px' }}>
      <p style={{ fontSize: '1.15rem', marginBottom: 24 }}>
        Welcome to the Datahub, the free, powerful data management platform from{' '}
        <a href="https://services.okfn.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', textDecoration: 'underline' }}>Open Knowledge International</a>,
        based on the <a href="https://ckan.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', textDecoration: 'underline' }}>CKAN</a> data management system.
      </p>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 32, marginBottom: 12, color: '#2563eb' }}>About CKAN</h2>
      <p style={{ marginBottom: 16 }}>
        CKAN is a tool for managing and publishing collections of data. It is used by national and local governments, research institutions, and other organisations which collect a lot of data. With its powerful search and faceting, users can browse and find the data they need, and preview it using maps, graphs and tables - whether they are developers, journalists, researchers, NGOs, citizens or your own colleagues.
      </p>
      <p style={{ marginBottom: 16 }}>
        CKAN is free, open-source software, which has been developed by the Open Knowledge Foundation since 2006 and used by government and organisations <a href="https://ckan.org/instances/" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', textDecoration: 'underline' }}>around the world</a>. Version 2.0 was released in May 2013.
      </p>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 32, marginBottom: 12, color: '#2563eb' }}>About the Datahub</h2>
      <p style={{ marginBottom: 16 }}>
        The Datahub provides free access to many of CKAN's core features, letting you search for data, register published datasets, create and manage groups of datasets, and get updates from datasets and groups you're interested in. You can use the web interface or, if you are a programmer needing to connect the Datahub with another app, the <a href="https://docs.ckan.org/en/ckan-2.0/index.html#the-ckan-api" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', textDecoration: 'underline' }}>CKAN API</a>.
      </p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 32, marginBottom: 12, color: '#2563eb' }}>Getting started</h2>
      <p style={{ marginBottom: 16 }}>
        Feel free to sign up - it will only take a minute. If you haven't used CKAN before, have a look at the <a href="https://docs.ckan.org/en/latest/user-guide.html" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', textDecoration: 'underline' }}>User Guide</a>, and try it out at <a href="https://demo.ckan.org" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', textDecoration: 'underline' }}>demo.ckan.org</a>. This is a demo instance - feel free to try out creating and editing datasets and groups.
      </p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 32, marginBottom: 12, color: '#2563eb' }}>Using groups</h2>
      <p style={{ marginBottom: 0 }}>
        You can use CKAN Groups to create and manage collections of datasets. This could be to catalogue datasets for a particular project or team, or on a particular theme, or as a very simple way to help people find and search your own published datasets.
      </p>
    </div>
  );
} 