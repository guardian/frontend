import { articles, liveblogs } from '../fixtures/pages';

const pages = [articles[0], liveblogs[0]];

describe('Reload page on consent change', () => {
	pages.forEach(({ path, adTest, expectedMinInlineSlotsOnPage }) => {
		it(`Test ${path} change from accept all to reject all`, () => {
			cy.spy(window.location, 'reload')

			cy.allowAllConsent();

			// cy.privacyManagerRejectAllConsent();

			expect(window.location.reload).to.be.called

		});
	});
});
