/// <reference types="cypress" />

import { fronts } from '../fixtures/pages/fronts';
import { articles } from '../fixtures/pages/articles';
import { liveblogs } from '../fixtures/pages/liveblogs';
import { fakeLogOut, fakeLogin } from '../lib/util';
import { AdFreeCookieReasons } from 'lib/manage-ad-free-cookie';

// Don't fail tests when uncaught exceptions occur
// This is because scripts loaded on the page and unrelated to these tests can cause this
Cypress.on('uncaught:exception', () => {
	return false;
});

const adsShouldShow = () => {
	cy.get('#dfp-ad--top-above-nav').should('exist');

	// Check that an iframe is placed inside the ad slot
	cy.get('#dfp-ad--top-above-nav').find('iframe').should('exist');
};

const adsShouldNotShow = () => {
	cy.get(`[data-name="top-above-nav"]`).should('not.exist');
};

const reconsent = () => {
	cy.get('[data-link-name="privacy-settings"]').scrollIntoView().click();

	cy.getIframeBody('iframe[title="SP Consent Message"]')
		.find(`button[title="Accept all"]`)
		.click();

	// waits are bad but how to wait for consent change?
	cy.wait(100);

	// scrollintoview not working for some reason
	cy.scrollTo('top');
	cy.wait(1);
};

const expectAdFree = (reasons: AdFreeCookieReasons[]) => {
	// wait is an antipattern and unreliable, maybe import onConsentChange and cypressify it?
	cy.wait(200);
	cy.then(function expectAdFree() {
		cy.getCookie('GU_AF1').should(
			reasons.length ? 'not.be.empty' : 'be.null',
		);
		if (reasons.length) {
			expect(
				JSON.parse(
					localStorage.getItem('gu.ad_free_cookie_reason') || '{}',
				),
			).to.have.keys(reasons);
		} else {
			expect(
				Object.keys(
					JSON.parse(
						localStorage.getItem('gu.ad_free_cookie_reason') ||
							'{}',
					),
				),
			).to.have.length(0);
		}
	});
};

describe('tcfv2 consent', () => {
	beforeEach(() => {
		cy.clearCookies();
		cy.clearLocalStorage();
	});

	[fronts[0], articles[0], liveblogs[0]].forEach(({ path, adTest }) => {
		it.only(`Test ${path} hides slots when consent is denied`, () => {
			cy.visit(`${path}?adtest=${adTest}`);

			cy.rejectAllConsent();

			cy.get(`[data-name="top-above-nav"]`).should('not.exist');

			cy.getCookie('GU_AF1').should('not.be.empty');

			expectAdFree([AdFreeCookieReasons.ConsentOptOut]);

			cy.reload();

			expectAdFree([AdFreeCookieReasons.ConsentOptOut]);

			cy.get(`[data-name="top-above-nav"]`).should('not.exist');
		});

		it(`Test ${path} shows ad slots when reconsented`, () => {
			cy.visit(`${path}?adtest=${adTest}`);

			cy.rejectAllConsent();

			// prevent support banner so we can click privacy settings button
			localStorage.setItem(
				'gu.prefs.engagementBannerLastClosedAt',
				`{"value":"${new Date().toISOString()}"}`,
			);

			cy.reload();

			reconsent();

			cy.reload();

			expectAdFree([]);

			adsShouldShow();
		});

		it(`Test ${path} reject all, login as subscriber, log out should not show ads`, () => {
			fakeLogin(true);

			cy.visit(`${path}?adtest=${adTest}`);

			cy.rejectAllConsent();

			expectAdFree([
				AdFreeCookieReasons.ConsentOptOut,
				AdFreeCookieReasons.Subscriber,
			]);

			fakeLogOut();

			cy.reload();

			expectAdFree([AdFreeCookieReasons.ConsentOptOut]);

			adsShouldNotShow();
		});

		it(`Test ${path} reject all, login as non-subscriber, log out should not show ads`, () => {
			fakeLogin(false);

			cy.visit(`${path}?adtest=${adTest}`);

			cy.rejectAllConsent();

			expectAdFree([AdFreeCookieReasons.ConsentOptOut]);

			fakeLogOut();

			expectAdFree([AdFreeCookieReasons.ConsentOptOut]);

			adsShouldNotShow();
		});

		it(`Test ${path} reject all, login as non-subscriber, reconsent should show ads`, () => {
			cy.visit(`${path}?adtest=${adTest}`);

			cy.rejectAllConsent();

			fakeLogin(false);

			// prevent support banner so we can click privacy settings button
			localStorage.setItem(
				'gu.prefs.engagementBannerLastClosedAt',
				`{"value":"${new Date().toISOString()}"}`,
			);

			cy.reload();

			expectAdFree([AdFreeCookieReasons.ConsentOptOut]);

			adsShouldNotShow();

			reconsent();

			expectAdFree([]);

			cy.reload();

			adsShouldShow();
		});

		it(`Test ${path} accept all, login as subscriber, subscription expires, should show ads`, () => {
			fakeLogin(true);

			cy.visit(`${path}?adtest=${adTest}`);

			cy.allowAllConsent();

			expectAdFree([AdFreeCookieReasons.Subscriber]);

			cy.setCookie(
				'gu_user_features_expiry',
				String(new Date().getTime() - 1000),
			);

			localStorage.setItem(
				'gu.ad_free_cookie_reason',
				`{"subscriber": ${new Date().getTime() - 1000}}`,
			);

			// to intercept response
			fakeLogin(false);

			cy.reload();

			expectAdFree([]);

			// reload twice so server is not sent ad free cookie
			cy.reload();

			adsShouldShow();
		});

		it(`Test ${path} reject all, login as subscriber, subscription expires, should not show ads`, () => {
			fakeLogin(true);

			cy.visit(`${path}?adtest=${adTest}`);

			cy.rejectAllConsent();

			expectAdFree([
				AdFreeCookieReasons.ConsentOptOut,
				AdFreeCookieReasons.Subscriber,
			]);

			cy.setCookie(
				'gu_user_features_expiry',
				String(new Date().getTime() - 1000),
			);

			localStorage.setItem(
				'gu.ad_free_cookie_reason',
				`{"subscriber": ${new Date().getTime() - 1000}}`,
			);

			// to intercept response
			fakeLogin(false);

			cy.reload();

			expectAdFree([AdFreeCookieReasons.ConsentOptOut]);

			// reload twice so server is not sent ad free cookie
			cy.reload();

			adsShouldNotShow();
		});

		it(`Test ${path} reject all, cookie/reason expires, cookie should renew expiry and remain`, () => {
			cy.visit(`${path}?adtest=${adTest}`);

			cy.rejectAllConsent();

			expectAdFree([AdFreeCookieReasons.ConsentOptOut]);

			const expiredTimestamp = new Date().getTime() - 1000;

			cy.setCookie('GU_AF1', String(expiredTimestamp));

			localStorage.setItem(
				'gu.ad_free_cookie_reason',
				`{"consent_opt_out": ${expiredTimestamp}}`,
			);

			cy.reload();

			expectAdFree([AdFreeCookieReasons.ConsentOptOut]);

			// expiries should update

			cy.then(() =>
				expect(
					Number(
						JSON.parse(
							localStorage.getItem('gu.ad_free_cookie_reason') ||
								'{}',
						).consent_opt_out,
					),
				).to.be.greaterThan(expiredTimestamp),
			);

			cy.getCookie('GU_AF1')
				.should('have.property', 'value')
				.then((value) =>
					expect(Number(value)).to.be.greaterThan(expiredTimestamp),
				);
		});

		it(`Test ${path} allow all, logged in, if localstorage reason is missing, keep ad free, don't show ads`, () => {
			fakeLogin(true);

			cy.setCookie('GU_AF1', String(new Date().getTime() + 100000));

			cy.visit(`${path}?adtest=${adTest}`);

			cy.allowAllConsent();

			cy.wait('@userData');

			cy.then(() => localStorage.removeItem('gu.ad_free_cookie_reason'));

			cy.reload();

			cy.getCookie('GU_AF1').should('exist');

			cy.get('#dfp-ad--top-above-nav').should('not.exist');
		});
	});
});
