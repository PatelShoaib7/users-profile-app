const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const isWin = process.platform === 'win32';

function ensureInstalled(dir, label) {
  const modulesPath = path.join(dir, 'node_modules');
  if (!fs.existsSync(modulesPath)) {
    console.log(`\n[Setup] Installing ${label} dependencies...`);
    execSync('npm install', { cwd: dir, stdio: 'inherit' });
  }
}

function prefixOutput(stream, tag, colorCode) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.trim()) {
        console.log(`\x1b[${colorCode}m[${tag}]\x1b[0m ${line}`);
      }
    }
  });
}

function spawnService(name, cwd, scriptName, colorCode) {
  const child = isWin
    ? spawn('cmd.exe', ['/d', '/s', '/c', `npm run ${scriptName}`], {
        cwd,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      })
    : spawn('npm', ['run', scriptName], {
        cwd,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

  prefixOutput(child.stdout, name, colorCode);
  prefixOutput(child.stderr, name, colorCode);

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\x1b[31m[${name}] exited with code ${code}\x1b[0m`);
    }
  });

  return child;
}

(function main() {
  console.log('============================================================');
  console.log(' PeoplePulse — Starting Backend API + Frontend Web App');
  console.log('============================================================');

  ensureInstalled(backendDir, 'Backend');
  ensureInstalled(frontendDir, 'Frontend');

  console.log('\n[Launcher] Backend API -> http://localhost:5000');
  console.log('[Launcher] Frontend UI -> http://localhost:5173\n');

  const apiProc = spawnService('BACKEND', backendDir, 'dev', '36');
  const webProc = spawnService('FRONTEND', frontendDir, 'dev', '32');

  const killTree = (proc) => {
    if (!proc || !proc.pid) return;
    if (isWin) {
      try {
        execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
      } catch {
        // Already exited
      }
    } else {
      proc.kill('SIGTERM');
    }
  };

  let shuttingDown = false;
  const cleanup = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log('\n[Launcher] Shutting down Backend and Frontend...');
    killTree(apiProc);
    killTree(webProc);
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
})();
