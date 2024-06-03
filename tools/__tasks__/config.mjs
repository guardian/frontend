import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

const paths = {
        target: path.join(dir, '../', '../', 'static', 'target'),
        hash: path.join(dir, '../', '../', 'static', 'hash'),
        src: path.join(dir, '../', '../', 'static', 'src'),
        public: path.join(dir, '../', '../', 'static', 'public'),
        vendor: path.join(dir, '../', '../', 'static', 'vendor'),
        root: path.join(dir, '../', '../'),
        conf: path.join(dir, '../', '../', 'common', 'conf', 'assets'),
    }
export { paths };
