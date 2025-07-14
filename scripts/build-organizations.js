const fs = require('fs');
const path = require('path');

const DATASETS_DIR = path.join(__dirname, '../datasets');
const INDEX_FILE = path.join(__dirname, '../organizations-index.json');
const DATASETS_INDEX_FILE = path.join(__dirname, '../datasets-index.json');

if (!fs.existsSync(DATASETS_DIR)) {
  fs.mkdirSync(DATASETS_DIR, { recursive: true });
}

let datasetsIndex = [];
if (fs.existsSync(DATASETS_INDEX_FILE)) {
  datasetsIndex = JSON.parse(fs.readFileSync(DATASETS_INDEX_FILE, 'utf-8'));
}

async function rebuildOrganizationsIndex() {
  const orgDirs = fs.readdirSync(DATASETS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  const organizations = [];
  for (const name of orgDirs) {
    const orgFile = path.join(DATASETS_DIR, name, 'organization.json');
    if (fs.existsSync(orgFile)) {
      const orgDetails = JSON.parse(fs.readFileSync(orgFile, 'utf-8'));
      const orgTitle = (orgDetails.title || name).trim();
      const orgName = (name || '').trim();
      const datasetCount = datasetsIndex.filter(ds => {
        return ds.organization === orgTitle || ds.organization === orgName;
      }).length;
      organizations.push({
        id: orgName,
        name: orgName,
        title: orgTitle,
        description: (orgDetails.description || '').trim(),
        image_url: orgDetails.image_url || null,
        created: orgDetails.created || null,
        packages: datasetCount,
        path: `datasets/${orgName}/organization.json`
      });
    }
  }
  fs.writeFileSync(INDEX_FILE, JSON.stringify(organizations, null, 2));
  console.log(`Organizations index rebuilt: ${organizations.length} organizations`);

  const lunr = require('lunr');
  const lunrOrgIndex = lunr(function () {
    this.ref('id');
    this.field('name');
    this.field('title');
    this.field('description');
    organizations.forEach(org => {
      this.add({
        id: org.id,
        name: org.name,
        title: org.title,
        description: org.description,
      });
    });
  });
  const lunrOrgIndexPath = path.join(__dirname, '../public/data/lunr-org-index.json');
  fs.writeFileSync(lunrOrgIndexPath, JSON.stringify(lunrOrgIndex));
  console.log('lunr-org-index.json generated:', lunrOrgIndexPath);
}

rebuildOrganizationsIndex();