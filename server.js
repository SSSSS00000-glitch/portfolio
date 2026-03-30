const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5555;
const ROOT = __dirname;

const mimeTypes = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // Save tokens to variables.css
  if (req.method === 'POST' && req.url === '/save-tokens') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { tokens } = JSON.parse(body);
        const filePath = path.join(ROOT, 'css', 'variables.css');
        let content = fs.readFileSync(filePath, 'utf8');

        for (const [name, value] of Object.entries(tokens)) {
          const regex = new RegExp(`(${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*)([^;]+)(;)`, 'g');
          content = content.replace(regex, `$1${value}$3`);
        }

        fs.writeFileSync(filePath, content, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ ok: true, saved: Object.keys(tokens).length }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // Handle save endpoint
  if (req.method === 'POST' && req.url === '/save-css') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { changes } = JSON.parse(body);
        let applied = [];

        for (const [selector, props] of Object.entries(changes)) {
          // Find which CSS file contains this selector
          const cssDir = path.join(ROOT, 'css');
          const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

          let found = false;
          for (const file of cssFiles) {
            const filePath = path.join(cssDir, file);
            let content = fs.readFileSync(filePath, 'utf8');

            // Try to find the selector in this file
            // Look for the selector (handle . and # escaping in regex)
            const escapedSel = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const selectorRegex = new RegExp(`(${escapedSel}\\s*\\{[^}]*?)\\}`, 's');
            const match = content.match(selectorRegex);

            if (match) {
              let block = match[1];
              for (const [prop, val] of Object.entries(props)) {
                const propRegex = new RegExp(`(${prop}\\s*:\\s*)([^;]+)(;)`, 'g');
                if (propRegex.test(block)) {
                  block = block.replace(new RegExp(`(${prop}\\s*:\\s*)([^;]+)(;)`, 'g'), `$1${val}$3`);
                } else {
                  // Add new property before closing
                  block += `\n  ${prop}: ${val};`;
                }
              }
              content = content.replace(match[0], block + '}');
              fs.writeFileSync(filePath, content, 'utf8');
              applied.push({ selector, file, props: Object.keys(props) });
              found = true;
              break;
            }
          }

          if (!found) {
            // If selector not found in any file, check media queries
            for (const file of cssFiles) {
              const filePath = path.join(cssDir, file);
              let content = fs.readFileSync(filePath, 'utf8');

              // Check inside media queries too
              const escapedSel = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              // Broader search - just check if selector text appears
              if (content.includes(selector.split(' > ')[0].split('.').pop()) ||
                  content.includes(selector)) {
                // Append to the file before the last closing brace or at end
                let newRule = `\n/* Editor addition */\n${selector} {\n`;
                for (const [prop, val] of Object.entries(props)) {
                  newRule += `  ${prop}: ${val};\n`;
                }
                newRule += '}\n';
                content += newRule;
                fs.writeFileSync(filePath, content, 'utf8');
                applied.push({ selector, file, props: Object.keys(props) });
                found = true;
                break;
              }
            }
          }
        }

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ ok: true, applied }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // Static file serving
  let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const mime = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
