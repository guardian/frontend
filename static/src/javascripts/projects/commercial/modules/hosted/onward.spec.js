import { fetchJson as fetchJson_ } from '../../../../lib/fetch-json';
import { loadOnwardComponent, _ } from './onward.js';

const { insertHTMLfromPlaceholders, generateUrlFromConfig } = _;

const fetchJson = fetchJson_;

jest.mock('../../../../lib/fetch-json', () => ({ fetchJson: jest.fn() }));

describe('URL generator', () => {
	it('generates correct URL from valid config', () => {
		const fakeConfig = {
			page: {
				ajaxUrl: 'some.url',
				contentType: 'gallery',
				pageId: 'pageId',
			},
		};
		const expectResult = 'some.url/pageId/gallery/onward.json';
		const result = generateUrlFromConfig(fakeConfig);

		expect(result).toEqual(expectResult);
	});
});

describe('Insert onward HTML', () => {
	it('calls own insertion method', () => {
		const fakePlaceholder = document.createElement('div');
		fakePlaceholder.innerHTML = '<div class="js-onward-placeholder"></div>';
		const fakeJson = { html: '<div class="next-page"></div>' };
		const result =
			'<div class="js-onward-placeholder"></div><div class="next-page"></div>';

		insertHTMLfromPlaceholders(fakeJson, [fakePlaceholder]);
		expect(fakePlaceholder.innerHTML).toBe(result);
	});
});

describe('Loading onward component', () => {
	afterEach(() => {
		fetchJson.mockReset();
	});

	it('Does not fetch onwards if placeholder length is 0', () => {
		loadOnwardComponent();
		expect(fetchJson).not.toHaveBeenCalled();
	});
});
