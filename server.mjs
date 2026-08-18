import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT) || 8123;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function sendError(response, status, message) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(message);
}

createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    sendError(response, 405, 'Method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname);
  } catch {
    sendError(response, 400, 'Invalid request path');
    return;
  }

  const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^[/\\]+/, '');
  const filePath = resolve(root, requestedPath);
  if (relative(root, filePath).startsWith('..')) {
    sendError(response, 403, 'Forbidden');
    return;
  }

  try {
    await access(filePath);
    const info = await stat(filePath);
    if (!info.isFile()) {
      sendError(response, 404, 'Not found');
      return;
    }
  } catch {
    sendError(response, 404, 'Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  if (request.method === 'HEAD') response.end();
  else createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`FactBuilder running at http://localhost:${port}`);
});
