export default {
    description: 'Compile images',
    task: [
        await import('./clean.mjs').then(module => module.default),
        await import('./copy.mjs').then(module => module.default),
        await import('./icons.mjs').then(module => module.default),
        await import('./svg.mjs').then(module => module.default),
    ],
};
