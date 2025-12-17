/**
 * Simple development server for TURIA INVADERS
 * Run with: bun server.js
 */

const server = Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        let path = url.pathname;

        // Default to index.html
        if (path === '/') {
            path = '/index.html';
        }

        // Try to serve the file
        const filePath = '.' + path;

        try {
            const file = Bun.file(filePath);
            const exists = await file.exists();

            if (!exists) {
                return new Response('Not Found', { status: 404 });
            }

            // Determine content type
            const ext = path.split('.').pop();
            const contentTypes = {
                'html': 'text/html',
                'css': 'text/css',
                'js': 'application/javascript',
                'json': 'application/json',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'gif': 'image/gif',
                'svg': 'image/svg+xml',
                'ico': 'image/x-icon'
            };

            return new Response(file, {
                headers: {
                    'Content-Type': contentTypes[ext] || 'application/octet-stream'
                }
            });
        } catch (e) {
            return new Response('Error: ' + e.message, { status: 500 });
        }
    }
});

console.log(`
╔════════════════════════════════════════════╗
║         TURIA INVADERS - Server            ║
╠════════════════════════════════════════════╣
║  Game running at: http://localhost:3000    ║
║  Press Ctrl+C to stop                      ║
╚════════════════════════════════════════════╝
`);
