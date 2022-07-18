import { fronts } from './fronts';
import { articles } from './articles';
import { liveblogs } from './liveblogs';

const allPages = [...fronts, ...articles, ...liveblogs];

export { articles, fronts, liveblogs, allPages };
