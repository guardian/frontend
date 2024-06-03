import cpy from 'cpy';
import path from 'node:path';
import { paths } from '../.././config.mjs';

const { public: publicDir, target } = paths;

export default {
    description: 'Copy images',
    task: () =>
        cpy(['**/*'], path.resolve(target, 'images'), {
            cwd: path.resolve(publicDir, 'images'),
            parents: true,
            nodir: true,
        }),
};
