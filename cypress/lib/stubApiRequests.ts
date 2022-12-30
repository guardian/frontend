import { mostReadGeo } from '../fixtures/api/most-read-geo';
import { mostRead } from '../fixtures/api/most-read';
import { regularStories } from '../fixtures/api/regular-stories';

const stubApiRequest = (url: string, response: object) =>
	cy.intercept(url, (req) => req.reply({ body: response }));

const stubApiRequests = () => {
	// stub most viewed right
	stubApiRequest(
		'https://api.nextgen.guardianapps.co.uk/most-read-geo.json?dcr=true',
		mostReadGeo,
	);
	// stub headlines
	stubApiRequest(
		'https://api.nextgen.guardianapps.co.uk/container/data/uk-alpha/news/regular-stories.json',
		regularStories,
	);
	// stub most viewed bottom
	stubApiRequest(
		'https://api.nextgen.guardianapps.co.uk/most-read/politics.json?dcr=true',
		mostRead,
	);
};

export { stubApiRequests };
