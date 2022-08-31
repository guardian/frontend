import { getStage, getTestUrl } from '../../lib/util';
import type { Page } from './Page';

const stage = getStage();

const articles: Page[] = [
	{
		path: getTestUrl(
			stage,
			'/politics/2022/feb/10/keir-starmer-says-stop-the-war-coalition-gives-help-to-authoritarians-like-putin',
			{ isDcr: true },
		),
	},
	{
		path: getTestUrl(
			stage,
			'/sport/2022/feb/10/team-gb-winter-olympic-struggles-go-on-with-problems-for-skeleton-crew',
			{ isDcr: true },
		),
	},
	{
		path: getTestUrl(
			stage,
			'/environment/2020/oct/13/maverick-rewilders-endangered-species-extinction-conservation-uk-wildlife',
			{ isDcr: true },
		),
		expectedMinInlineSlotsOnPage: 10,
	},
	{
		path: getTestUrl(
			stage,
			'/society/2020/aug/13/disabled-wont-receive-critical-care-covid-terrifying',
			{ isDcr: true },
		),
		name: 'sensitive-content',
	},
];

export { articles };
