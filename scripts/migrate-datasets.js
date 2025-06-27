//const fetch = require('node-fetch');
//const fs = require('fs');
//const path = require('path');
//
//const OLD_CKAN = 'https://old.datahub.io/api/3/action';
//const DATA_DIR = path.join(__dirname, '../datasets');
//
//async function fetchDatasetList() {
//  const res = await fetch(`${OLD_CKAN}/package_list`);
//  const data = await res.json();
//  if (!data.success) throw new Error('Failed to fetch dataset list');
//  return data.result;
//}
//
//async function fetchDataset(name) {
//  const res = await fetch(`${OLD_CKAN}/package_show?id=${encodeURIComponent(name)}`);
//  const data = await res.json();
//  if (!data.success) throw new Error('Failed to fetch dataset: ' + name);
//  return data.result;
//}
//
//function toDatapackage(dataset) {
//  return {
//    name: dataset.name,
//    title: dataset.title || '',
//    description: dataset.notes || '',
//    version: dataset.version || '',
//    keywords: (dataset.tags || []).map(t => t.name),
//    organization: dataset.organization ? dataset.organization.title || dataset.organization.name : '',
//    licenses: dataset.license_title ? [{ name: dataset.license_id, title: dataset.license_title, path: dataset.license_url }] : [],
//    resources: (dataset.resources || []).map(res => ({
//      name: res.name,
//      description: res.description || '',
//      format: res.format || '',
//      path: res.url,
//      mediatype: res.mimetype || '',
//      size: res.size || null,
//      created: res.created || null,
//      last_modified: res.last_modified || null,
//      state: res.state || 'active'
//    })),
//    created: dataset.metadata_created || null,
//    modified: dataset.metadata_modified || null
//  };
//}
//
//async function saveDatapackage(dataset) {
//  const org = dataset.organization ? (dataset.organization.name || dataset.organization.title || 'unknown-org') : 'unknown-org';
//  const dsName = dataset.name;
//  const dir = path.join(DATA_DIR, org, dsName);
//  fs.mkdirSync(dir, { recursive: true });
//  const dp = toDatapackage(dataset);
//  fs.writeFileSync(path.join(dir, 'datapackage.json'), JSON.stringify(dp, null, 2));
//  console.log(`Saved: ${org}/${dsName}/datapackage.json`);
//}
//
//async function saveDatapackageRaw(dataset) {
//  const org = dataset.organization ? (dataset.organization.name || dataset.organization.title || 'unknown-org') : 'unknown-org';
//  const dsName = dataset.name;
//  const dir = path.join(DATA_DIR, org, dsName);
//  fs.mkdirSync(dir, { recursive: true });
//  fs.writeFileSync(path.join(dir, 'datapackage.json'), JSON.stringify(dataset, null, 2));
//  console.log(`Saved raw: ${org}/${dsName}/datapackage.json`);
//}
//
//function sleep(ms) {
//  return new Promise(resolve => setTimeout(resolve, ms));
//}
//
//async function main() {
//  const datasetList = await fetchDatasetList();
//  const failed = [];
//  for (const dsName of datasetList) {
//    try {
//      const dataset = await fetchDataset(dsName);
//      await saveDatapackageRaw(dataset);
//    } catch (e) {
//      console.error('Error:', dsName, e.message);
//      failed.push(dsName);
//    }
//    await sleep(1000);
//  }
//  if (failed.length > 0) {
//    fs.writeFileSync('failed-datasets.txt', failed.join('\n'));
//    console.log(`Failed datasets saved to failed-datasets.txt (${failed.length})`);
//  }
//}
//
// main();