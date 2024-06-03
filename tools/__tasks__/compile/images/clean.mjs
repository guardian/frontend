import path from 'node:path';
import rimraf from 'rimraf';

import { paths } from '../../config.mjs';

const { target, hash, src } = paths;

export default {
    description: 'Clear image build artefacts',
    task: () => {
        rimraf.sync(path.resolve(src, 'stylesheets', 'icons'));
        rimraf.sync(path.resolve(target, 'images'));
        rimraf.sync(path.resolve(hash, 'images'));
    },
};
