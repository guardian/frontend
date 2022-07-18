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
		adTest: 'fixed-puppies',
	},
	{
		path: getTestUrl(stage, '/commentisfree'),
		section: 'commentisfree',
		adTest: 'fixed-puppies',
	},
	{
		path: getTestUrl(stage, '/sport'),
		section: 'sport',
		adTest: 'fixed-puppies',
	},
];

export { fronts };
