import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

let data = '';
process.stdin.on('data', (chunk) => data += chunk);
process.stdin.on('end', () => {
  const json = JSON.parse(data);
  const command = json.tool_input?.command || '';

  // git commit コマンドのみ対象
  if (!/\bgit\s+commit\b/.test(command)) {
    process.exit(0);
  }

  // tool_response でコミット成功を確認（exit code 0）
  const exitCode = json.tool_response?.exitCode;
  if (exitCode !== undefined && exitCode !== 0) {
    process.exit(0);
  }

  let dir = dirname(new URL(import.meta.url).pathname);
  if (/^\/[A-Za-z]:/.test(dir)) {
    dir = dir.slice(1);
  }
  const projectRoot = resolve(dir, '..', '..');

  const checks = [
    { name: 'backend/lint', cmd: 'pnpm run lint', cwd: 'backend' },
    { name: 'backend/typecheck', cmd: 'pnpm run typecheck', cwd: 'backend' },
    { name: 'backend/test', cmd: 'pnpm run test', cwd: 'backend' },
    { name: 'frontend/lint', cmd: 'pnpm run lint', cwd: 'frontend' },
    { name: 'frontend/typecheck', cmd: 'pnpm run typecheck', cwd: 'frontend' },
    { name: 'frontend/test', cmd: 'pnpm run test', cwd: 'frontend' },
    { name: 'infrastructure/lint', cmd: 'pnpm run lint', cwd: 'infrastructure' },
    { name: 'infrastructure/typecheck', cmd: 'pnpm run typecheck', cwd: 'infrastructure' },
  ];

  const results = [];
  let hasFailure = false;

  for (const check of checks) {
    const cwd = resolve(projectRoot, check.cwd);
    if (!existsSync(cwd)) {
      results.push(`⏭ ${check.name}: skipped (directory not found)`);
      continue;
    }
    try {
      execSync(check.cmd, { cwd, stdio: 'pipe', timeout: 120000 });
      results.push(`✅ ${check.name}: passed`);
    } catch (e) {
      hasFailure = true;
      const stderr = e.stderr?.toString() || '';
      const stdout = e.stdout?.toString() || '';
      const output = (stdout + '\n' + stderr).trim();
      // 出力が長い場合は末尾のみ
      const truncated = output.length > 500
        ? '...\n' + output.slice(-500)
        : output;
      results.push(`❌ ${check.name}: FAILED\n${truncated}`);
    }
  }

  const summary = results.join('\n');

  if (hasFailure) {
    const result = {
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `Post-commit CI checks completed with failures:\n${summary}`
      }
    };
    console.log(JSON.stringify(result));
  } else {
    const result = {
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `Post-commit CI checks all passed:\n${summary}`
      }
    };
    console.log(JSON.stringify(result));
  }
});
