import { basename } from 'node:path';

const SENSITIVE_PATTERNS = [
  /^\.env$/,
  /^\.env\..+$/,
  /\.pem$/,
  /\.key$/,
  /\.p12$/,
  /\.pfx$/,
  /\.jks$/,
  /^credentials\.json$/,
  /^secrets\.json$/,
  /secret/i,
  /credential/i,
  /^id_rsa$/,
  /^id_ed25519$/,
  /^id_ecdsa$/,
  /^id_dsa$/,
  /^CLAUDE\.local\.md$/,
];

const SENSITIVE_GLOB_PATTERNS = [
  /\.env/,
  /\.pem/,
  /\.key/,
  /\.p12/,
  /\.pfx/,
  /\.jks/,
  /secret/i,
  /credential/i,
  /id_rsa/,
  /id_ed25519/,
  /id_ecdsa/,
  /id_dsa/,
];

function isSensitivePath(filePath) {
  if (!filePath) return false;
  const normalized = filePath.replace(/\\/g, '/');
  const name = basename(normalized);
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(name));
}

function isSensitiveGlob(glob) {
  if (!glob) return false;
  return SENSITIVE_GLOB_PATTERNS.some((pattern) => pattern.test(glob));
}

function block(reason) {
  const result = {
    decision: 'block',
    reason,
  };
  console.log(JSON.stringify(result));
  process.exit(2);
}

let data = '';
process.stdin.on('data', (chunk) => data += chunk);
process.stdin.on('end', () => {
  const json = JSON.parse(data);
  const toolName = json.tool_name || '';
  const input = json.tool_input || {};

  if (toolName === 'Read' || toolName === 'Edit' || toolName === 'Write') {
    const filePath = input.file_path || '';
    if (isSensitivePath(filePath)) {
      block(`Blocked: "${filePath}" is a sensitive file. Access denied to protect secrets.`);
    }
  }

  if (toolName === 'Grep') {
    const searchPath = input.path || '';
    if (isSensitivePath(searchPath)) {
      block(`Blocked: "${searchPath}" is a sensitive file. Access denied to protect secrets.`);
    }
    const glob = input.glob || '';
    if (isSensitiveGlob(glob)) {
      block(`Blocked: glob pattern "${glob}" may match sensitive files. Access denied to protect secrets.`);
    }
  }

  process.exit(0);
});
