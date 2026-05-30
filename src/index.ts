import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { join } from 'path';

const distPath = join(import.meta.dir, '..', 'dist');

const staticApp = await staticPlugin({
  assets: distPath,
  prefix: '/',
});

new Elysia()
  .use(staticApp)
  .listen(3000);

console.log('0721 calc → http://localhost:3000');
console.log('  serving:', distPath);
