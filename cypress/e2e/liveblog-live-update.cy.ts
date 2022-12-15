import { breakpoints } from '../fixtures/breakpoints';
import { liveblogs } from '../fixtures/pages';
import { mockIntersectionObserver } from '../lib/util';

const pages = [...liveblogs];

describe('Liveblog live updates', () => {
	beforeEach(() => {
		cy.useConsentedSession('liveblog-live-update-consented');
	});

	pages.forEach(({ path, expectedMinInlineSlotsOnPage }) => {
		breakpoints.forEach(({ breakpoint, width, height }) => {
			it(`Test ads are inserted when liveblogs live update, breakpoint: ${breakpoint}`, () => {
				cy.viewport(width, height);

				cy.visit(path, {
					onBeforeLoad(win) {
						mockIntersectionObserver(win, '#top-of-blog');
					},
				});

				cy.get('#liveblog-body .ad-slot').its('length').as('adCount');

				cy.window().invoke('mockLiveUpdate', {
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

				if (expectedMinInlineSlotsOnPage) {
					cy.get('@adCount').then((adCount) => {
						cy.get(
							`#dfp-ad--inline${
								breakpoint === 'mobile'
									? expectedMinInlineSlotsOnPage + 3
									: expectedMinInlineSlotsOnPage + 1
							}`,
						).should('exist');
						cy.get('#liveblog-body .ad-slot')
							.its('length')
							.should('be.gt', adCount);
					});
				}
			});
		});
	});
});
