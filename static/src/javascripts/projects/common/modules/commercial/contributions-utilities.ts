const pageShouldHideReaderRevenue = (): boolean =>
	window.guardian.config.page.shouldHideReaderRevenue ??
	window.guardian.config.page.sponsorshipType === 'paid-content';

export { pageShouldHideReaderRevenue };
