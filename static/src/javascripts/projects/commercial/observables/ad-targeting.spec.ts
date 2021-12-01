import { setCookie } from '@guardian/libs';
import { getPageTargeting } from '../../common/modules/commercial/build-page-targeting';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { adTargeting } from './ad-targeting';

describe('Comparison with getPageTargeting', () => {
	it('should return the same values', (done) => {
		window.guardian.config.page = {
			authorIds: 'profile/gabrielle-chan',
			blogIds: 'a/blog',
			contentType: 'Video',
			edition: 'US',
			keywordIds:
				'uk-news/prince-charles-letters,uk/uk,uk/prince-charles',
			pageId: 'football/series/footballweekly',
			publication: 'The Observer',
			seriesId: 'film/series/filmweekly',
			sponsorshipType: 'advertisement-features',
			tones: 'News',
			videoDuration: 63,
			sharedAdTargeting: {
				bl: ['blog'],
				br: 'p',
				co: ['gabrielle-chan'],
				ct: 'video',
				edition: 'us',
				k: ['prince-charles-letters', 'uk/uk', 'prince-charles'],
				ob: 't',
				p: 'ng',
				se: ['filmweekly'],
				su: ['5'],
				tn: ['news'],
				url: '/football/series/footballweekly',
			},
			isSensitive: false,
			// isHosted: true,
			// isDev: true,
			// isFront: false,
			// ajaxUrl: '/dummy/',
			// hasPageSkin: false,
			// assetsPath: '/dummy/',
			// section: 'unknown',
			// pbIndexSites: [],
			// adUnit: 'none',
		} as unknown as PageConfig;
		window.guardian.config.ophan = { pageViewId: 'presetOphanPageViewId' };

		commercialFeatures.adFree = false;

		setCookie({ name: 'adtest', value: 'ng101' });

		const oldPageTargeting = getPageTargeting();

		adTargeting.subscribe((newPageTargeting) => {
			expect(newPageTargeting).toEqual(oldPageTargeting);
			done();
		});
	});
});
