import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const paths = {
	root,
	target: join(root, 'static', 'target'),
	hash: join(root, 'static', 'hash'),
	src: join(root, 'static', 'src'),
	public: join(root, 'static', 'public'),
	vendor: join(root, 'static', 'vendor'),
	conf: join(root, 'common', 'conf', 'assets'),
};
