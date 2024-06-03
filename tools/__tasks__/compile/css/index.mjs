export default {
    description: 'Compile CSS',
    task: [
        import('./clean.mjs'),
        import('./mkdir.mjs'),
        import('../images/index.mjs'),
        import('./sass.mjs'),
    ],
};
