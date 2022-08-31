import { breakpoints } from '../fixtures/breakpoints';
import { articles, liveblogs } from '../fixtures/pages';

const pages = [...liveblogs];

describe('Liveblog live updates', () => {
	pages.forEach(({ path }) => {
		breakpoints.forEach(({ breakpoint, width }) => {
			it(`Test ads are inserted when liveblogs live update, breakpoint: ${breakpoint}`, () => {
				cy.viewport(width, 500);

				cy.visit(path);

				cy.allowAllConsent();

				cy.get('#liveblog-body .ad-slot').then((adSlots) => {
					const adSlotCount = adSlots.length;

					cy.window().then((win) => {
						win.mockLiveUpdate({
							numNewBlocks: 5,
							html: `
							<p style="height:1000px;" class="pending block">New block</p>
							<p style="height:1000px;" class="pending block">New block</p>
							<p style="height:1000px;" class="pending block">New block</p>
							<p style="height:1000px;" class="pending block">New block</p>
							<p style="height:1000px;" class="pending block">New block</p>
							`,
							mostRecentBlockId: 'abc',
						});

						cy.get('#liveblog-body .block')
							.first()
							.should('have.css', 'opacity', '1')
							.scrollIntoView();

						// eslint-disable-next-line cypress/no-unnecessary-waiting
						cy.wait(300);

						cy.get('#liveblog-body .ad-slot').then((adSlots) => {
							const newAdSlotCount = adSlots.length;

							expect(newAdSlotCount).to.be.greaterThan(
								adSlotCount,
							);
						});
					});
				});
			});
		});
	});
});
