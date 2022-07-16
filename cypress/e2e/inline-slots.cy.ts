import { breakpoints } from '../fixtures/breakpoints';
import { articles } from '../fixtures/pages/articles';
import { liveblogs } from '../fixtures/pages/liveblogs';

const pages = [...articles, ...liveblogs].filter(
	(page) => 'expectedMinInlineSlotsOnPage' in page,
);

describe('Slots and iframes load on pages', () => {
	pages.forEach(({ path, adTest, expectedMinInlineSlotsOnPage }) => {
		Object.entries(breakpoints).forEach(([breakpoint, width]) => {
			it(`Test ${path} has at least ${expectedMinInlineSlotsOnPage} inline total slots at breakpoint ${breakpoint}`, () => {
				cy.viewport(width, 500);

				cy.visit(`${path}?adtest=${adTest}`);

				// Click "Yes, I'm happy" on the sourcepoint banner to obtain consent
				cy.getIframeBody('sp_message_iframe_')
					.find('.btn-primary')
					.click();

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
});
