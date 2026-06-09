/**
 * Runs `vite build` without forwarding npm CLI args.
 * Prevents failures when extra tokens (e.g. "# all green") are passed to npm run build/verify.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const result = spawnSync(npx, ['vite', 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
