//const fs = require('fs');
//const path = require('path');
//const https = require('https');
//
//const CKAN_BASE_URL = 'https://old.datahub.io';
//const OUTPUT_DIR = path.join(__dirname, '../organizations');
//const INDEX_FILE = path.join(__dirname, '../organizations-index.json');
//const DATASETS_INDEX_FILE = path.join(__dirname, '../datasets-index.json');
//
//if (!fs.existsSync(OUTPUT_DIR)) {
//  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
//}
//
//function makeRequest(url) {
//  return new Promise((resolve, reject) => {
//    https.get(url, (res) => {
//      let data = '';
//      res.on('data', (chunk) => data += chunk);
//      res.on('end', () => {
//        try {
//          const parsed = JSON.parse(data);
//          resolve(parsed);
//        } catch (e) {
//          reject(e);
//        }
//      });
//    }).on('error', reject);
//  });
//}
//
//async function getOrganizationDetails(name) {
//  console.log(`Fetching details for organization: ${name}`);
//  const response = await makeRequest(`${CKAN_BASE_URL}/api/3/action/organization_show?id=${encodeURIComponent(name)}`);
//  if (!response.success) {
//    throw new Error(`Failed to fetch organization details for ${name}`);
//  }
//  return response.result;
//}
//
//let datasetsIndex = [];
//if (fs.existsSync(DATASETS_INDEX_FILE)) {
//  datasetsIndex = JSON.parse(fs.readFileSync(DATASETS_INDEX_FILE, 'utf-8'));
//}
//
//async function saveOpenHamptonRoadsOrg() {
//  const orgName = 'open-hampton-roads';
//  try {
//    const orgDetails = await getOrganizationDetails(orgName);
//    const orgDir = path.join(OUTPUT_DIR, orgName);
//    if (!fs.existsSync(orgDir)) {
//      fs.mkdirSync(orgDir, { recursive: true });
//    }
//    const orgFile = path.join(orgDir, 'organization.json');
//    const orgTitle = orgDetails.title || orgName;
//    const datasetCount = datasetsIndex.filter(ds => {
//      return ds.organization === orgTitle || ds.organization === orgName;
//    }).length;
//    fs.writeFileSync(orgFile, JSON.stringify(orgDetails, null, 2));
//    const indexEntry = {
//      id: orgName,
//      name: orgName,
//      title: orgTitle,
//      description: orgDetails.description || '',
//      image_url: orgDetails.image_url || null,
//      created: orgDetails.created || null,
//      packages: datasetCount,
//      path: `organizations/${orgName}/organization.json`
//    };
//    fs.writeFileSync(INDEX_FILE, JSON.stringify([indexEntry], null, 2));
//    console.log(`✓ Saved organization: ${orgName}`);
//    console.log(`  - ${orgFile}`);
//    console.log(`  - ${INDEX_FILE}`);
//  } catch (error) {
//    console.error(`✗ Failed to process ${orgName}:`, error.message);
//  }
//}
//
//saveOpenHamptonRoadsOrg();