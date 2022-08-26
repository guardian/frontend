import { getStage, getTestUrl } from '../../lib/util';
import type { Page } from './Page';

type Front = Page & {
	section: string;
};

const stage = getStage();

const fronts: Front[] = [
	{
		path: getTestUrl(stage, '/uk'),
		section: 'uk',
	},
	{
		path: getTestUrl(stage, '/commentisfree'),
		section: 'commentisfree',
	},
	{
		path: getTestUrl(stage, '/sport'),
		section: 'sport',
	},
];

export { fronts };
