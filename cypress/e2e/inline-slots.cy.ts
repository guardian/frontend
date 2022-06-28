import { liveblogs, articles } from '../fixtures/pages';

const pages = [articles[2], ...liveblogs];

describe('Slots and iframes load on pages', () => {
	pages.forEach(({ path, adTest, expectedMinInlineSlotsOnPage }) => {
		it(`Test ${path} has at least ${expectedMinInlineSlotsOnPage} inline total slots`, () => {
			cy.visit(`${path}?adtest=${adTest}`);

			// Click "Yes, I'm happy" on the sourcepoint banner to obtain consent
			cy.getIframeBody('sp_message_iframe_').find('.btn-primary').click();

			cy.scrollTo('bottom', { duration: 5000 });

			[...Array(expectedMinInlineSlotsOnPage).keys()].forEach(
				(item, i) => {
					cy.get(`[data-name="inline${i + 1}"]`).should(
						'have.length',
						1,
					);
				},
			);
		});
	});
});
