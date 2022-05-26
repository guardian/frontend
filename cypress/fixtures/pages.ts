import { getStage, getTestUrl } from '../lib/util';

const stage = getStage();

const fronts = [
	{
		path: getTestUrl(stage, '/uk'),
		adTest: 'fixed-puppies',
	},
];

const articles = [
	{
		path: getTestUrl(
			stage,
			'/politics/2022/feb/10/keir-starmer-says-stop-the-war-coalition-gives-help-to-authoritarians-like-putin',
			{ isDcr: true },
		),
		adTest: 'fixed-puppies',
	},
	{
		path: getTestUrl(
			stage,
			'/sport/2022/feb/10/team-gb-winter-olympic-struggles-go-on-with-problems-for-skeleton-crew',
			{ isDcr: true },
		),
		adTest: 'fixed-puppies',
	},
];

const liveblogs = [
	{
		path: getTestUrl(
			stage,
			'/politics/live/2022/jan/31/uk-politics-live-omicron-nhs-workers-coronavirus-vaccines-no-10-sue-gray-report',
			{ isDcr: true },
		),
		adTest: 'fixed-puppies',
	},
];

const pages = [...fronts, ...articles, ...liveblogs];

export { fronts, pages, articles, liveblogs };
