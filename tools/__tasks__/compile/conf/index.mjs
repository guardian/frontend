export default {
    description: 'Compile assets for template rendering in Play',
    task: [import('./copy.mjs'), import('../inline-svgs/index.mjs')],
};
