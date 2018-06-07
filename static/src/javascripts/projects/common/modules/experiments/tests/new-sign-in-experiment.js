// @flow
import fastdom from 'lib/fastdom-promise';
import config from 'lib/config';

const getSignInLinks = (): Promise<Element[]> =>
    fastdom.read(() => [
        ...document.querySelectorAll(
            `a[href="${config.get(
                'page.idUrl'
            )}/signin?INTCMP=DOTCOM_NEWHEADER_SIGNIN"]`
        ),
    ]);

export const newSignInExperiment: ABTest = {
    id: 'NewSignInExperiment',
    start: '2018-06-07',
    expiry: '2019-06-07',
    author: 'Laura gonzalez',
    description:
        'This test will send a % of users to the new sign in experience.',
    audience: 0,
    audienceOffset: 0.7,
    successMeasure: 'Users in the new sign in experience sign in more',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Less dropoffs',
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: (): void => {
                getSignInLinks().then(links => {
                    links.forEach(link => {
                        if (link instanceof HTMLAnchorElement) {
                            link.href = `${config.get(
                                'page.idUrl'
                            )}/signin/start?INTCMP=sign-in-ab-variant`;
                        }
                    });
                });
            },
        },
        {
            id: 'control',
            test: (): void => {
                getSignInLinks().then(links => {
                    links.forEach(link => {
                        if (link instanceof HTMLAnchorElement) {
                            link.href = `${config.get(
                                'page.idUrl'
                            )}/signin?INTCMP=sign-in-ab-control`;
                        }
                    });
                });
            },
        },
    ],
};
