import { breakpoints } from '../fixtures/breakpoints';
import { articles, liveblogs } from '../fixtures/pages';
import { mockIntersectionObserver } from '../lib/util';

const pages = articles.filter((page) => 'expectedMinInlineSlotsOnPage' in page);

const liveBlogPages = liveblogs.filter(
	(page) => 'expectedMinInlineSlotsOnPage' in page,
);

describe('Slots and iframes load on article pages', () => {
	beforeEach(() => {
		cy.useConsentedSession('article-consented');
	});

	pages.forEach(({ path, expectedMinInlineSlotsOnPage }) => {
		breakpoints.forEach(({ breakpoint, width, height }) => {
			it(`Test ${path} has at least ${expectedMinInlineSlotsOnPage} inline total slots at breakpoint ${breakpoint}`, () => {
				cy.viewport(width, height);

				cy.visit(path, {
					onBeforeLoad(win) {
						mockIntersectionObserver(win, '.ad-slot--inline');
					},
				});

				cy.get('.ad-slot--inline')
					.should(
						'have.length.at.least',
						expectedMinInlineSlotsOnPage,
					)
					.each((slot) => {
						cy.wrap(slot).scrollIntoView();
						cy.wrap(slot).find('iframe').should('exist');
					});
			});
		});
	});
});

describe('Slots and iframes load on liveblog pages', () => {
	beforeEach(() => {
		cy.useConsentedSession('liveblog-consented-2');
	});
	liveBlogPages.forEach(({ path, expectedMinInlineSlotsOnPage }) => {
		breakpoints.forEach(({ breakpoint, width, height }) => {
			it(`Test ${path} has at least ${expectedMinInlineSlotsOnPage} inline total slots at breakpoint ${breakpoint}`, () => {
				cy.viewport(width, height);

				cy.visit(path, {
					onBeforeLoad(win) {
						mockIntersectionObserver(
							win,
							'.ad-slot--liveblog-inline',
						);
					},
				});

				cy.get('.ad-slot--liveblog-inline').should(
					'have.length.at.least',
					expectedMinInlineSlotsOnPage,
				);
			});
		});
	});
});
