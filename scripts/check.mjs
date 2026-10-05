import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// dist is authored source. Check the embed adapter and bundled scripts as well as modules.
for (const file of readdirSync('dist').filter(name => /\.m?js$/.test(name))) {
  execFileSync(process.execPath, ['--check', 'dist/' + file], { stdio: 'inherit' });
}
console.log('Static JavaScript syntax checks passed; dist is the authored application.');
