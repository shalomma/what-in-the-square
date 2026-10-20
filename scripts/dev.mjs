// Accept the preview supervisor's Vite-style flags while running Next.js.
import { spawn } from 'node:child_process';
const args = process.argv.slice(2).filter(arg => arg !== '--strictPort').map(arg => arg === '--host' ? '--hostname' : arg);
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', ...(args.length ? args : ['--hostname', '0.0.0.0', '--port', '4173'])], { stdio: 'inherit' });
child.on('exit', code => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
