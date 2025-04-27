const express = require('express');
const Ajv = require('ajv');
const { loadTools } = require('./utils/loadTools');



const app = express();
const ajv = new Ajv();
app.use(express.json());

let tools = {};
let schemas = {};

async function init() {
  const loaded = await loadTools();
  tools = loaded.tools;
  schemas = loaded.schemas;
}



app.post('/rpc', async (req, res) => {
  const { jsonrpc, method, params, id } = req.body;

  if (jsonrpc !== '2.0') {
    return res.json({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid JSON-RPC version' }, id });
  }

  // 🛠 Check if the method is "chain" FIRST
  if (method === "chain") {
    let prevResult = null;

    for (const step of params) {
      const stepMethod = step.method;
      let stepParams = step.params;

      // Replace "$prev" if needed
      stepParams = JSON.parse(JSON.stringify(stepParams).replace(/\$prev/g, prevResult));

      const validate = ajv.compile(schemas[stepMethod]);
      const valid = validate(stepParams);

      if (!valid) {
        return res.json({
          jsonrpc: "2.0",
          error: { code: -32602, message: "Invalid params in chain", data: validate.errors },
          id,
        });
      }

      prevResult = await tools[stepMethod](stepParams);
    }

    // Set the final result from the last tool execution (prevResult)
    return res.set('Content-Type', 'application/json').send(
      JSON.stringify({ jsonrpc: '2.0', result: prevResult, id }, null, 2)
    );
  }

  // 🛠 Now normal RPC tools
  const tool = tools[method];
  if (!tool) {
    return res.json({ jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id });
  }

  const validate = ajv.compile(schemas[method]);
  const valid = validate(params);

  if (!valid) {
    return res.json({ jsonrpc: '2.0', error: { code: -32602, message: 'Invalid params', data: validate.errors }, id });
  }

  try {
    const result = await tool(params);
    return res.json({ jsonrpc: '2.0', result, id });
  } catch (err) {
    return res.json({ jsonrpc: '2.0', error: { code: -32000, message: err.message }, id });
  }
});



app.get('/v1/manifest', (req, res) => {
  const manifest = {
    name: "Mini Context Protocol Server",
    version: "1.0.0",
    description: "A mini version of MCP built for learning and fun!",
    tools: Object.keys(tools).map(toolName => ({
      name: toolName,
      description: schemas[toolName]?.description || "No description provided",
      version: "1.0.0" // (or read from manifest.json in future)
    }))
  };

  res.json(manifest);
});







init().then(() => {
  app.listen(3000, () => {
    console.log('🚀 Mini-CP Server running on http://localhost:3000');
  });
});
