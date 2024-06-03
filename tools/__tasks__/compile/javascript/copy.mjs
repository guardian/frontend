import cpy from 'cpy';
import path from 'node:path';
import { paths } from '../.././config.mjs';

const { vendor, target } = paths;

export default {
    description: 'Copy 3rd JS party libraries',
    task: () =>
        Promise.all([
            cpy(
                [
                    'formstack-interactive/**/*',
                    'prebid_safeframe.js',
                    'polyfillio.minimum.fallback.js',
                    'omsdk-v1.js',
                ],
                path.resolve(target, 'javascripts', 'vendor'),
                {
                    cwd: path.resolve(vendor, 'javascripts'),
                    parents: true,
                    nodir: true,
                }
            ),
        ]),
};
