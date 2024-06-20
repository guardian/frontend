export default {
    description: 'Compile assets for template rendering in Play',
    task: [
      await import('./copy.mjs').then(module => module.default),
      await import('../inline-svgs/index.mjs').then(module => module.default),
    ],
};
