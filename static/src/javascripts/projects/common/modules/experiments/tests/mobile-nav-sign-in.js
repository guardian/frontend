// @flow
import fastdom from 'lib/fastdom-promise';

const replaceTopnavMobileLinkWith = (label: string): Promise<void> =>
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
                topNavLinkEl.classList.remove('hide-until-desktop');
                topNavLinkEl.classList.add('hide-until-mobile-medium');
                topNavLinkElBody.innerHTML = label;
            })
        );

export const mobileNavSignIn: ABTest = {
    id: 'MobileNavSignIn',
    start: '2018-06-07',
    expiry: '2019-06-07',
    author: 'Laura gonzalez',
    description: 'This test will show a sign in link in the mobile nav.',
    audience: 0.1,
    audienceOffset: 0.5,
    successMeasure: 'signed in mobile users',
    audienceCriteria: 'mobile users',
    dataLinkNames: 'n/a',
    idealOutcome: 'More signed in users',
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: (): void => {},
        },
        {
            id: 'variant-register',
            test: (): void => {
                replaceTopnavMobileLinkWith('Register');
            },
        },
        {
            id: 'variant-sign-in',
            test: (): void => {
                replaceTopnavMobileLinkWith('Sign in');
            },
        },
    ],
};
