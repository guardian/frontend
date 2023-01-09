import { mostReadGeo } from '../fixtures/api/most-read-geo';
import { mostRead } from '../fixtures/api/most-read';
import { regularStories } from '../fixtures/api/regular-stories';
import { longRead } from '../fixtures/api/long-read';

const stubApiRequest = (matchUrl: string, response: object) =>
	cy.intercept(matchUrl, (req) => {
		console.log('matching', req.url, matchUrl);
		req.reply({ body: response });
	});

const stubApiRequests = () => {
	// most viewed right
	stubApiRequest(
		'https://api.nextgen.guardianapps.co.uk/most-read-geo.json?dcr=true',
		mostReadGeo,
	);
	// headlines
	stubApiRequest(
		'https://api.nextgen.guardianapps.co.uk/container/data/uk-alpha/news/regular-stories.json',
		regularStories,
	);
	// most viewed bottom
	stubApiRequest(
		'https://api.nextgen.guardianapps.co.uk/most-read/*',
		mostRead,
	);
	// long read
	stubApiRequest(
		'https://api.nextgen.guardianapps.co.uk/series/news/series/the-long-read**/**',
		longRead,
	);
};

export { stubApiRequests };
