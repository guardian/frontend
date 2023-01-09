import { mostReadGeo } from '../fixtures/api/most-read-geo';
import { mostRead } from '../fixtures/api/most-read';
import { regularStories } from '../fixtures/api/regular-stories';
import { longRead } from '../fixtures/api/long-read';

const stubApiRequest = (matchUrl: string, response: object) =>
	cy.intercept(matchUrl, (req) => {
		console.log('matching', req.url, matchUrl);
		req.reply({ body: response });
	});

/**
 * Cypress matches URLs using a glob pattern via minimatch.
 * You can test if the pattern will match the intended URLs here:
 * https://lironzluf.github.io/minimatch-playground/
 *
 * Be careful when changing these patterns. An incorrect glob
 * could mean Cypress will not intercept and stub the request.
 * Snapshot tests will pass locally but visual regression tests
 * in Percy will fail.
 */
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
		// variations:
		// https://api.nextgen.guardianapps.co.uk/most-read/politics.json?dcr=true
		// https://api.nextgen.guardianapps.co.uk/most-read/business.json?dcr=true
		// https://api.nextgen.guardianapps.co.uk/most-read/football.json?dcr=true
		'https://api.nextgen.guardianapps.co.uk/most-read/*',
		mostRead,
	);
	// long read
	stubApiRequest(
		// variations:
		// https://api.nextgen.guardianapps.co.uk/series/news/series/the-long-read.json?dcr&shortUrl=/p/y8ykh
		'https://api.nextgen.guardianapps.co.uk/series/news/series/the-long-read**/**',
		longRead,
	);
};

export { stubApiRequests };
