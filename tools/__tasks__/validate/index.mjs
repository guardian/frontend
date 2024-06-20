export default {
    description: 'Lint assets',
    task: [
        import('./javascript.mjs'),
        import('./typescript.mjs'),
        import('./sass.mjs'),
        import('./check-for-disallowed-strings.mjs'),
    ],
    concurrent: true,
};
