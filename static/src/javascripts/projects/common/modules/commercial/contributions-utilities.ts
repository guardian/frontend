import { storage } from '@guardian/libs';

const getVisitCount = (): number =>
	parseInt(storage.local.getRaw('gu.alreadyVisited') ?? '', 10) || 0;

const pageShouldHideReaderRevenue = (): boolean =>
	window.guardian.config.page.shouldHideReaderRevenue ??
	window.guardian.config.page.sponsorshipType === 'paid-content';

export { pageShouldHideReaderRevenue, getVisitCount };
