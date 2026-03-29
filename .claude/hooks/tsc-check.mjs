import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

let data = '';
process.stdin.on('data', (chunk) => data += chunk);
process.stdin.on('end', () => {
  const json = JSON.parse(data);
  const filePath = json.tool_input?.file_path || json.tool_response?.filePath || '';
  if (!/\.(ts|tsx)$/.test(filePath)) {
    process.exit(0);
  }

  const normalized = filePath.replace(/\\/g, '/');
  let subdir = '';
  if (normalized.includes('/backend/')) {
    subdir = 'backend';
  } else if (normalized.includes('/frontend/')) {
    subdir = 'frontend';
  } else {
    process.exit(0);
  }

  // Find project root by traversing up from this script
  let dir = dirname(new URL(import.meta.url).pathname);
  // On Windows, remove leading slash from /C:/...
  if (/^\/[A-Za-z]:/.test(dir)) {
    dir = dir.slice(1);
  }
  const projectRoot = resolve(dir, '..', '..');
  const targetDir = resolve(projectRoot, subdir);
  const tsconfigPath = resolve(targetDir, 'tsconfig.json');

  if (!existsSync(tsconfigPath)) {
    process.exit(0);
  }

  try {
    execSync('pnpx tsc --noEmit', { cwd: targetDir, stdio: 'pipe' });
  } catch (e) {
    const stderr = e.stderr?.toString() || '';
    const stdout = e.stdout?.toString() || '';
    const output = (stdout + '\n' + stderr).trim();
    const result = {
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `TypeScript type check errors in ${subdir}/:\n${output}`
      }
    };
    console.log(JSON.stringify(result));
  }
});
