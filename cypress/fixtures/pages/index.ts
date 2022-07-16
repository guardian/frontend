import { fronts } from './fronts';
import { articles } from './articles';
import { liveblogs } from './liveblogs';

const pages = [...fronts, ...articles, ...liveblogs];

export { pages };
