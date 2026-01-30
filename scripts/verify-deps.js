import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nodeModulesExists = fs.existsSync(path.join(__dirname, '..', 'node_modules'));
const packageLockExists = fs.existsSync(path.join(__dirname, '..', 'package-lock.json'));

if (!nodeModulesExists || !packageLockExists) {
  console.error('❌ Dependencies not properly installed. Run npm install.');
  process.exit(1);
} else {
  console.log('✅ Dependencies verified.');
}
