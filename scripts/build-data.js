const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../datasets');
const outFile = path.join(__dirname, '../datasets-index.json');

function getOrgString(dp) {
 if (dp.organization) {
   if (typeof dp.organization === 'string') {
     return dp.organization.trim();
   }
   if (typeof dp.organization === 'object') {
     return (dp.organization.title || dp.organization.name || '').trim();
   }
 }
 return '';
}

function getTags(dp) {
 if (Array.isArray(dp.tags)) {
   return dp.tags.map(t => t.name).filter(Boolean);
 }
 return [];
}

function getLicenses(dp) {
 if (Array.isArray(dp.licenses) && dp.licenses.length > 0) {
   return dp.licenses.map(l => l.title || l.name || 'Not specified').filter(Boolean);
 }
 if (dp.license_title) return [dp.license_title];
 if (dp.license_id) return [dp.license_id];
 return [];
}

function getFormats(dp) {
 if (Array.isArray(dp.resources)) {
   return Array.from(new Set(dp.resources.map(r => (r.format || '').toUpperCase()).filter(Boolean)));
 }
 return [];
}

function getDescription(dp) {
 return dp.notes || dp.description || '';
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
         results.push({
           id: dp.name,
           title: dp.title,
           description: getDescription(dp),
           organization: getOrgString(dp),
           tags: getTags(dp),
           path: `datasets/${org}/${ds}/datapackage.json`,
           formats: getFormats(dp),
           licenses: getLicenses(dp),
           created: dp.metadata_created || dp.created || null,
           modified: dp.metadata_modified || dp.modified || null
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

const lunr = require('lunr');
const lunrIndex = lunr(function () {
  this.ref('id');
  this.field('title');
  this.field('description');
  this.field('organization');
  this.field('tags');
  index.forEach(ds => {
    this.add({
      id: ds.id,
      title: ds.title,
      description: ds.description,
      organization: ds.organization,
      tags: (ds.tags || []).join(' '),
    });
  });
});
const lunrIndexPath = path.join(__dirname, '../public/data/lunr-index.json');
fs.writeFileSync(lunrIndexPath, JSON.stringify(lunrIndex));
console.log('lunr-index.json generated:', lunrIndexPath);
