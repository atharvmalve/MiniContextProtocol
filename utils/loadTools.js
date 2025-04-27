const fs = require('fs');
const path = require('path');

async function loadTools() {
  const toolsDir = path.join(__dirname, '..', 'tools');
  const tools = {};
  const schemas = {};
  const manifests = {};

  const toolFolders = fs.readdirSync(toolsDir);

  for (const folder of toolFolders) {
    const toolPath = path.join(toolsDir, folder);
    if (fs.lstatSync(toolPath).isDirectory()) {
      const handler = require(path.join(toolPath, 'index.js'));
      const schema = require(path.join(toolPath, 'schema.json'));
      const manifest = require(path.join(toolPath, 'manifest.json'));

      const toolName = manifest.name;
      tools[toolName] = handler;
      schemas[toolName] = schema;
      manifests[toolName] = manifest;
    }
  }

  return { tools, schemas, manifests };
}

module.exports = {loadTools};
