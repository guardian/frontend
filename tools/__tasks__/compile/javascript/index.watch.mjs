export default {
    description: 'Prepare JS for development',
    task: [
        import('../inline-svgs/index.mjs'),
        import('./clean.mjs'),
        import('./copy.mjs'),
        import('./bundle-polyfills.mjs'),
    ],
};
