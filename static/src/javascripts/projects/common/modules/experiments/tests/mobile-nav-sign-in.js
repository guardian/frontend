// @flow
import fastdom from 'lib/fastdom-promise';

const replaceTopnavMobileLinkWith = (
    campaign: string,
    label: ?string
): Promise<void> =>
    fastdom
        .read(() => ({
            topNavLinkEl: document.querySelector(
                '.js-navigation-sign-in-top-nav'
            ),
            topNavLinkElBody: document.querySelector(
                '.js-navigation-sign-in-top-nav-body'
            ),
        }))
        .then(({ topNavLinkEl, topNavLinkElBody }) =>
            fastdom.write(() => {
                if (label) {
                    topNavLinkElBody.innerHTML = label;
                    topNavLinkEl.classList.remove('hide-until-desktop');
                    topNavLinkEl.classList.add('hide-until-mobile-medium');
                }
                topNavLinkEl.href += `&ABCMP=${campaign}`;
            })
        );

export const mobileNavSignIn: ABTest = {
    id: 'MobileNavSignIn',
    start: '2018-06-07',
    expiry: '2019-06-07',
    author: 'Laura gonzalez',
    description: 'This test will show a sign in link in the mobile nav.',
    audience: 0.3,
    audienceOffset: 0.4,
    successMeasure: 'exploratory',
    audienceCriteria: 'mobile users',
    dataLinkNames: 'n/a',
    idealOutcome: 'A better understanding of clicks on our sign in button',
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: (): void => {
                replaceTopnavMobileLinkWith('ab-control');
            },
        },
        {
            id: 'variant-register',
            test: (): void => {
                replaceTopnavMobileLinkWith('ab-register', 'Register');
            },
        },
        {
            id: 'variant-sign-in',
            test: (): void => {
                replaceTopnavMobileLinkWith('ab-sign-in', 'Sign in');
            },
        },
    ],
};
