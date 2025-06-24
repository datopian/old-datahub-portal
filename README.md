# PortalJS Frontend Starter

> This is a CKAN-based PortalJS website bootstrapped with https://github.com/datopian/portaljs-frontend-starter

## Usage

This is a template for the creation of PortalJS CKAN decoupled frontends, powered by React and Next.js.

**Demo:** https://portaljs-cloud-frontend-template.vercel.app

### PortalJS Cloud

PortalJS Cloud uses this template for creating new portals.

If you want to quickly get started for free, navigate to https://cloud.portaljs.com and create an account!

PortalJS Cloud will automatically setup a GitHub repository for your portal, based on this template, and deploy it.

Your portal's GitHub repository can be found on your PortalJS Cloud dashboard, and you can raise PRs against it to customize your portal, or let us handle the customization for you by reaching out to us at portaljs@datopian.com.

Learn more at https://portaljs.com/

### Standalone

> [!note]
> In standalone mode, you are going to need your own dedicated CKAN instance.

In order to use this repository in standalone mode (i.e. without PortalJS Cloud), click on the "Use this template" button on the top right corner to replicate this code to a new repo.

Then, you can start customizing it locally by following the development instructions bellow, and/or deploy it somewhere such as on Vercel.

## Development

1) Clone this repository

2) Install the dependencies with `npm i`

3) Create a new `.env` file with:

```bash
# This is the URL of the CKAN instance. Use the example value if you are using PortalJS Cloud.
NEXT_PUBLIC_DMS=https://api.cloud.portaljs.com

# Leave it empty if you are not using PortalJS Cloud. This is the name of the main organization for your portal in PortalJS Cloud.
# You can find the this value in the Organizations page in the PortalJS Cloud dashboard.
NEXT_PUBLIC_ORG=my-org
```

4) Run `npm run dev` to start the development server

5) Access `http://localhost:3000` in your browser

## Customization

This template was developed with Next.js/React and TailwindCSS.

In order to learn more about how it can be customized, check the following documentations:

- https://react.dev/
- https://nextjs.org/docs
- https://v3.tailwindcss.com/docs/installation

## Context

DataHub v1 (formerly known simply as DataHub) was originally built on CKAN v2.6 and hosted by Datopian for several years. Over time, maintaining the platform—and especially upgrading CKAN—became increasingly labor-intensive. Because the datasets on DataHub v1 represent important, long-term contributions from organizations around the globe, we’ve decided to preserve its contents in a read-only format. To simplify maintenance and ensure continued access, we will migrate DataHub v1 to a lightweight, read-only front end powered by the PortalJS framework.

### Desired outcome

- All datasets and metadata are available.
- Search is working, it could be simple full-text search without facets.
- All data resources are downloadable.
- UI/UX is upgraded.

### Challenges

1. Metadata

- Dropping CKAN means we need to store metadata somewhere else. Since the DataHub supports Data Packages, it is suggested to export metadata in frictionless spec and store them as JSON files somewhere, e.g., on GitHub where we follow clear semantic path structure: `/<owner>/<dataset>/datapackage.json`.

2. Search engine

- CKAN relies on Apache Solr for its search capabilities, so replacing CKAN as the backend means we need a new, lightweight search solution. We’ve proposed using Lunr.js, which runs entirely in the browser and requires no server component. While we’ve successfully used Typesense in other projects, its server-based architecture makes it heavier than Lunr. The remaining question is whether an in-browser index can efficiently handle metadata for over 1,000 datasets without becoming too large.
- We can use approach similar to OpenSpending.org where we have datapackages (metadata) stored in github and we create an index file out of them.

### TODOs

- [ ] Export metadata as data packages and store them in github. For example, within https://github.com/datopian/old-datahub-portal repo create a directory `datasets` and have `/datasets/owner-org/dataset-name/datapackage.json`.
- [ ] Try to build search index using these datapackages, eg, using Lunr or similar alternative. Look at how openspending.org index works.