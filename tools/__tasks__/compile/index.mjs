export default {
  description: 'Compile assets for production',
  task: [
    await import('./conf/clean.mjs'),
    await import('./css/index.mjs'),
    await import('./data/index.mjs'),
    await import('./javascript/index.mjs'),
    await import('./hash/index.mjs'),
    await import('./conf/index.mjs'),
  ],
}
