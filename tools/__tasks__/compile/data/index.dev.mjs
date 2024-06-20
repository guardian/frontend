export default {
    description: 'Clean download and build data assets (dev)',
    task: [
      await import('./clean.mjs').then(module => module.default),
      await import('./download.mjs').then(module => module.default),
      await import('./amp.mjs').then(module => module.default),
    ],
};
