import { storage } from '@guardian/libs';
import config from '../../../../lib/config';

const getVisitCount = () =>
	parseInt(storage.local.getRaw('gu.alreadyVisited'), 10) || 0;

const pageShouldHideReaderRevenue = () =>
	config.get('page.shouldHideReaderRevenue') ||
	config.get('page.sponsorshipType') === 'paid-content';

export { pageShouldHideReaderRevenue, getVisitCount };
