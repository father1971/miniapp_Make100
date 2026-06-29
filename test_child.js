import { exec } from 'child_process';
const child = exec('npx cross-env NODE_ENV=production node dist/server.cjs');
child.stdout.on('data', console.log);
child.stderr.on('data', console.error);
child.on('exit', code => console.log('Exited with', code));
setTimeout(() => process.exit(0), 3000);
