import { pageShouldHideReaderRevenue } from 'common/modules/commercial/contributions-utilities';
import { shouldHideSupportMessaging } from 'common/modules/commercial/user-features';
import { _ } from './adblock-ask';

const { params, canShow } = _;

jest.mock('../common/modules/commercial/contributions-utilities');
jest.mock('../common/modules/commercial/user-features');
jest.mock('ophan/ng', () => null);
jest.mock('lib/raven');

describe('adblock-ask', () => {
	it('has the correct URL params', () => {
		expect(params.toString()).toBe(
			'acquisitionData=%7B%22componentType%22%3A%22ACQUISITIONS_OTHER%22%2C%22source%22%3A%22GUARDIAN_WEB%22%2C%22campaignCode%22%3A%22shady_pie_open_2019%22%2C%22componentId%22%3A%22shady_pie_open_2019%22%7D&INTCMP=shady_pie_open_2019',
		);
	});

	it('should show if possible', () => {
		window.guardian.config.page.hasShowcaseMainElement = false;
		(pageShouldHideReaderRevenue as jest.Mock).mockReturnValue(false);
		(shouldHideSupportMessaging as jest.Mock).mockReturnValue(false);

		expect(canShow()).toBe(true);
	});

	it.each([
		['page.hasShowcaseMainElement', true, false, false],
		['pageShouldHideReaderRevenue', false, true, false],
		['shouldHideSupportMessaging', false, false, true],
	])('should not show if is %s is true', (_, a, b, c) => {
		window.guardian.config.page.hasShowcaseMainElement = a;
		(pageShouldHideReaderRevenue as jest.Mock).mockReturnValue(b);
		(shouldHideSupportMessaging as jest.Mock).mockReturnValue(c);

		expect(canShow()).toBe(false);
	});
});
