import { fronts } from './fronts';
import { articles } from './articles';
import { liveblogs } from './liveblogs';

const allPages = [...articles, ...liveblogs];

export { articles, liveblogs, allPages };
