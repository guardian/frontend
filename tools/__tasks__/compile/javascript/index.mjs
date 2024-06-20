export default {
  description: 'Compile JS',
  task: [
      await import('./clean.mjs').then(module => module.default),
      await import('../inline-svgs/index.mjs').then(module => module.default),
      await import('./copy.mjs').then(module => module.default),
      await import('./webpack.mjs').then(module => module.default),
      await import('./webpack-atoms.mjs').then(module => module.default),
      await import('./bundle-polyfills.mjs').then(module => module.default),
  ],
};
