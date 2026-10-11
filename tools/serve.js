#!/usr/bin/env node
/*
  Local preview server (no dependencies):   node tools/serve.js [port]
  Serves the project folder like the live site: folder URLs (/, /id/, /de/) open their index.html.
*/
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const port = Number(process.argv[2]) || 8000;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".xml": "text/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png"
};

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/id" || url === "/de") { res.writeHead(301, { location: url + "/" }); return res.end(); }
  if (url.endsWith("/")) url += "index.html";
  const file = path.join(root, url);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("Not found"); }
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(data);
  });
}).listen(port, () => console.log(`Preview: http://localhost:${port}  (Ctrl+C to stop)`));
