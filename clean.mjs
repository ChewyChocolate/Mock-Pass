import { rmSync, existsSync } from 'node:fs';

const targets = ['dist', 'server.js'];

for (const target of targets) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
    console.log(`removed ${target}`);
  }
}
