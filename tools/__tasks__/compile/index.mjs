export default {
  description: 'Compile assets for production',
  task: [
    await import('./conf/clean.mjs').then(module => module.default),
    await import('./css/index.mjs').then(module => module.default),
    await import('./data/index.mjs').then(module => module.default),
    await import('./javascript/index.mjs').then(module => module.default),
    await import('./hash/index.mjs').then(module => module.default),
    await import('./conf/index.mjs').then(module => module.default),
  ],
}
