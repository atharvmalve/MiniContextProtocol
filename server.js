const express = require('express');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const greet = require('./tools/greet');
const add = require('./tools/add');

const app = express();
app.use(express.json());

const ajv = new Ajv();

// Load manifest
const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf-8'));

// Map of tool handlers and schemas
const tools = {
  greet: {
    handler: greet,
    schema: JSON.parse(fs.readFileSync('./schemas/greet.schema.json', 'utf-8'))
  },
  add:{
    handler: add,
    schema: JSON.parse(fs.readFileSync('./schemas/add.schema.json', 'utf-8'))
  }
};

// JSON-RPC handler
app.post('/rpc', (req, res) => {
  const { jsonrpc, method, params, id } = req.body;

  if (jsonrpc !== '2.0' || !method) {
    return res.json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request' },
      id: id || null
    });
  }

  const tool = tools[method];
  if (!tool) {
    return res.json({
      jsonrpc: '2.0',
      error: { code: -32601, message: 'Method not found' },
      id
    });
  }

  const valid = ajv.validate(tool.schema, params);
  if (!valid) {
    return res.json({
      jsonrpc: '2.0',
      error: { code: -32602, message: 'Invalid params', data: ajv.errors },
      id
    });
  }

  // Handle notification (no response)
  if (id === undefined) {
    tool.handler(params);
    return res.status(204).end(); // No Content
  }

  // Handle request
  try {
    const result = tool.handler(params);
    return res.json({
      jsonrpc: '2.0',
      result,
      id
    });
  } catch (err) {
    return res.json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Server error', data: err.message },
      id
    });
  }
});

app.listen(3000, () => {
  console.log('Mini-CP running on http://localhost:3000');
});
