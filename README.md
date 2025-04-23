# Mini-CP (Mini Context Protocol)

A minimal and educational implementation of a protocol inspired by the Model Context Protocol (MCP), built using Node.js and Express.js.

This project currently supports basic JSON-RPC 2.0 calls, tool execution, and schema validation using ajv.

## What it Does (So Far)

* Parses JSON-RPC 2.0 requests
* Executes tool functions based on method names
* Validates input params using JSON Schema (ajv)
* Returns standard JSON-RPC error/success responses

## How to Run Locally

1.  **Clone the repository**

    ```bash
    git clone [https://github.com/your-username/mini-cp.git](https://github.com/atharvmalve/MiniContextProtocol.git)
    cd mini-cp
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Start the server**

    ```bash
    npm run dev
    ```

4.  **Test with curl (bash example)**

    ```bash
    curl -X POST http://localhost:3000/rpc \
      -H "Content-Type: application/json" \
      -d '{ "jsonrpc": "2.0", "method": "greet", "params": { "name": "World!" }, "id": 1 }'
    ```

## What’s Coming Next?

* Dynamic tool registration from manifest
* Full tool metadata descriptions
* Session/context management
* Chained tool execution (tool → tool)
* Better developer ergonomics

## Inspired by

* [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/modelcontextprotocol)

## Contributions

This is a solo project for now, built to learn and experiment publicly.

Feel free to fork and mess around with it!
