export default {
  description: 'Compile assets for production',
  task: [
    import('./conf/clean.mjs'),
    import('./css/index.mjs'),
    import('./data/index.mjs'),
    import('./javascript/index.mjs'),
    import('./hash/index.mjs'),
    import('./conf/index.mjs'),
  ],
}
