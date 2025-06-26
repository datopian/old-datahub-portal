const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../public/data/datasets');
const outFile = path.join(__dirname, '../public/data/datasets-index.json');

function getOrgTitle(org) {
  if (!org) return '';
  if (typeof org === 'string') return org;
  if (typeof org === 'object') return org.title || org.name || '';
  return '';
}

function getOrgString(dp) {
  if (dp.organization) {
    if (typeof dp.organization === 'string') {
      return dp.organization;
    }
    if (typeof dp.organization === 'object') {
      return dp.organization.title || dp.organization.name || '';
    }
  }
  if (Array.isArray(dp.sources) && dp.sources.length > 0 && dp.sources[0].name) {
    return dp.sources[0].name;
  }
  return '';
}

function getAllDatapackages(dir) {
  const orgs = fs.readdirSync(dir);
  let results = [];
  for (const org of orgs) {
    const orgPath = path.join(dir, org);
    if (!fs.statSync(orgPath).isDirectory()) continue;
    const datasets = fs.readdirSync(orgPath);
    for (const ds of datasets) {
      const dsPath = path.join(orgPath, ds);
      const dpPath = path.join(dsPath, 'datapackage.json');
      if (fs.existsSync(dpPath)) {
        try {
          const raw = fs.readFileSync(dpPath, 'utf-8');
          const dp = JSON.parse(raw);
          const formats = Array.isArray(dp.resources)
            ? Array.from(new Set(dp.resources.map(r => (r.format || '').toUpperCase()).filter(Boolean)))
            : [];
          const licenses = Array.isArray(dp.licenses)
            ? Array.from(new Set(dp.licenses.map(l => l.title || l.name || 'Not specified').filter(Boolean)))
            : [];
          results.push({
            id: dp.name,
            title: dp.title,
            description: dp.description,
            organization: getOrgString(dp),
            tags: Array.isArray(dp.keywords) ? dp.keywords : [],
            path: `datasets/${org}/${ds}/datapackage.json`,
            formats,
            licenses,
            created: dp.created || null,
            modified: dp.modified || null
          });
        } catch (e) {
          console.error('Error reading', dpPath, e);
        }
      }
    }
  }
  return results;
}

const index = getAllDatapackages(baseDir);
fs.writeFileSync(outFile, JSON.stringify(index, null, 2));
console.log('datasets-index.json generated:', outFile);
