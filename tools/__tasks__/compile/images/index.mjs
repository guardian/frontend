export default {
    description: 'Compile images',
    task: [
        import('./clean.mjs'),
        import('./copy.mjs'),
        import('./icons.mjs'),
        import('./svg.mjs'),
    ],
};
