import { getStage, getTestUrl } from '../../lib/util';
import type { Page } from './Page';

const stage = getStage();

const liveblogs: Page[] = [
	{
		path: getTestUrl(
			stage,
			'/politics/live/2022/jan/31/uk-politics-live-omicron-nhs-workers-coronavirus-vaccines-no-10-sue-gray-report?live=true',
			{ isDcr: true },
		),
		expectedMinInlineSlotsOnPage: 4,
	},
];

export { liveblogs };
