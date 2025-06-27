const fs = require('fs');
const path = require('path');
const https = require('https');

const CKAN_BASE_URL = 'https://old.datahub.io';
const OUTPUT_DIR = path.join(__dirname, '../public/data/organizations');
const INDEX_FILE = path.join(__dirname, '../public/data/organizations-index.json');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getOrganizationsList() {
  console.log('Fetching organizations list...');
  const response = await makeRequest(`${CKAN_BASE_URL}/api/3/action/organization_list`);
  
  if (!response.success) {
    throw new Error('Failed to fetch organizations list');
  }
  
  return response.result;
}

async function getOrganizationDetails(name) {
  console.log(`Fetching details for organization: ${name}`);
  const response = await makeRequest(`${CKAN_BASE_URL}/api/3/action/organization_show?id=${encodeURIComponent(name)}`);
  
  if (!response.success) {
    throw new Error(`Failed to fetch organization details for ${name}`);
  }
  
  return response.result;
}

async function migrateOrganizations() {
  try {
    const orgNames = await getOrganizationsList();
    console.log(`Found ${orgNames.length} organizations`);
    
    const organizations = [];
    const failedOrgs = [];
    
    for (let i = 0; i < orgNames.length; i++) {
      const name = orgNames[i];
      
      try {
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const orgDetails = await getOrganizationDetails(name);
        
        const orgDir = path.join(OUTPUT_DIR, name);
        if (!fs.existsSync(orgDir)) {
          fs.mkdirSync(orgDir, { recursive: true });
        }
        
        const orgFile = path.join(orgDir, 'organization.json');
        fs.writeFileSync(orgFile, JSON.stringify(orgDetails, null, 2));
        
        const indexEntry = {
          id: name,
          name: name,
          title: orgDetails.title || name,
          description: orgDetails.description || '',
          image_url: orgDetails.image_url || null,
          created: orgDetails.created || null,
          packages: orgDetails.packages ? orgDetails.packages.length : 0,
          path: `organizations/${name}/organization.json`
        };
        
        organizations.push(indexEntry);
        console.log(`✓ Processed: ${name}`);
        
      } catch (error) {
        console.error(`✗ Failed to process ${name}:`, error.message);
        failedOrgs.push({ name, error: error.message });
      }
    }
    
    fs.writeFileSync(INDEX_FILE, JSON.stringify(organizations, null, 2));
    
    console.log(`\nMigration completed!`);
    console.log(`✓ Successfully processed: ${organizations.length} organizations`);
    console.log(`✗ Failed: ${failedOrgs.length} organizations`);
    
    if (failedOrgs.length > 0) {
      console.log('\nFailed organizations:');
      failedOrgs.forEach(org => {
        console.log(`  - ${org.name}: ${org.error}`);
      });
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateOrganizations();