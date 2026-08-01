import { spawn } from 'node:child_process';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const electronCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const vite = spawn(npmCommand, ['run', 'dev:renderer', '--', '--host', '127.0.0.1'], { stdio: 'inherit' });
const timer = setTimeout(() => {
  const electron = spawn(electronCommand, ['electron', '.'], { stdio: 'inherit', env: { ...process.env, DADUM_VITE_DEV_SERVER_URL: 'http://127.0.0.1:5173/' } });
  electron.on('exit', (code) => { vite.kill(); process.exit(code ?? 0); });
}, 1200);
vite.on('exit', (code) => { clearTimeout(timer); if (code) process.exit(code); });
