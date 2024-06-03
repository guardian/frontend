import path from 'node:path';
import rimraf from 'rimraf';

import { paths } from '../../config.mjs';

const { target, hash } = paths;

export default {
    description: 'Clear JS build artefacts',
    task: () => {
        rimraf.sync(path.resolve(target, 'javascripts'));
        rimraf.sync(path.resolve(hash, 'javascripts'));
    },
};
