// Minimal stdio client for Chrome DevTools MCP (npm: chrome-devtools-mcp).
// Spawns the server, does the MCP handshake and exposes call(toolName, args).
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const MCP_VERSION = process.env.CHROME_MCP_VERSION || '1.12.0';

function chromeArgs() {
  const args = [];
  // Cloud containers ship Playwright's Chromium instead of Chrome; use it when present.
  const pw = '/opt/pw-browsers';
  if (process.env.CHROME_PATH) args.push('--executablePath', process.env.CHROME_PATH);
  else if (fs.existsSync(pw)) {
    const dir = fs.readdirSync(pw).find(d => /^chromium-\d+$/.test(d));
    const exe = dir && `${pw}/${dir}/chrome-linux64/chrome`;
    if (exe && fs.existsSync(exe)) args.push('--executablePath', exe, '--chromeArg=--no-sandbox');
  }
  // Chrome ignores HTTPS_PROXY; pass the egress proxy explicitly when one is set.
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) args.push(`--chromeArg=--proxy-server=${proxy}`);
  return args;
}

export async function startMcp() {
  const p = spawn('npx', ['-y', `chrome-devtools-mcp@${MCP_VERSION}`, '--headless', '--isolated', '--allow-unrestricted-paths',
    '--no-usage-statistics', '--no-performance-crux', ...chromeArgs()], {stdio: ['pipe', 'pipe', 'ignore']});
  let buf = '', id = 0; const pend = {};
  p.stdout.on('data', d => {
    buf += d; let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const l = buf.slice(0, i); buf = buf.slice(i + 1);
      try { const m = JSON.parse(l); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } } catch {}
    }
  });
  const rpc = (method, params, ms = 120000) => new Promise((res, rej) => {
    const i = ++id;
    const to = setTimeout(() => { delete pend[i]; rej(new Error('timeout ' + method)); }, ms);
    pend[i] = m => { clearTimeout(to); res(m); };
    p.stdin.write(JSON.stringify({jsonrpc: '2.0', id: i, method, params}) + '\n');
  });
  await rpc('initialize', {protocolVersion: '2025-06-18', capabilities: {}, clientInfo: {name: 'forbidden-wording-audit', version: '1'}});
  p.stdin.write(JSON.stringify({jsonrpc: '2.0', method: 'notifications/initialized'}) + '\n');
  const call = async (name, args) => {
    const m = await rpc('tools/call', {name, arguments: args});
    const txt = (m.result?.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
    if (m.error || m.result?.isError) throw new Error(name + ': ' + (m.error?.message || txt));
    return txt;
  };
  return {call, kill: () => p.kill()};
}

// evaluate_script wraps its return value in a ```json block
export function parseEval(txt) {
  const m = txt.match(/```json\n([\s\S]*?)\n```/);
  return JSON.parse(m ? m[1] : txt);
}
