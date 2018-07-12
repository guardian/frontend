// @flow
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import config from 'lib/config';

const getSignInLinks = (): Promise<Element[]> =>
    fastdom.read(() => [
        ...document.querySelectorAll(
            `a[href="${config.get(
                'page.idUrl'
            )}/signin?INTCMP=DOTCOM_NEWHEADER_SIGNIN"]`
        ),
    ]);

const getCommentSignInLinks = (): Promise<Element[]> =>
    new Promise(accept => {
        mediator.on('comments-count-loaded', accept);
    }).then(() =>
        fastdom.read(() => [
            ...document.querySelectorAll(
                `a[href="${config.get(
                    'page.idUrl'
                )}/signin?INTCMP=DOTCOM_COMMENTS_SIGNIN"]`
            ),
        ])
    );

const getCommentRegisterLinks = (): Promise<Element[]> =>
    new Promise(accept => {
        mediator.on('comments-count-loaded', accept);
    }).then(() =>
        fastdom.read(() => [
            ...document.querySelectorAll(
                `a[href="${config.get(
                    'page.idUrl'
                )}/register?INTCMP=DOTCOM_COMMENTS_REG"]`
            ),
        ])
    );

const replaceLinks = (links: Element[], newHref: string): void => {
    links.forEach(link => {
        if (link instanceof HTMLAnchorElement) {
            link.href = `${config.get('page.idUrl')}/${newHref}`;
        }
    });
};

export const newSignInExperiment: ABTest = {
    id: 'NewSignInExperimentBumpAgain',
    start: '2018-06-07',
    expiry: '2019-06-07',
    author: 'Laura gonzalez',
    description:
        'This test will send a % of users to the new sign in experience.',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'Users in the new sign in experience sign in more',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Less dropoffs',
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: (): void => {
                getSignInLinks().then(links => {
                    replaceLinks(
                        links,
                        'signin?INTCMP=sign-in-ab-control&from=topnav'
                    );
                });
                getCommentSignInLinks().then(links => {
                    replaceLinks(
                        links,
                        'signin?INTCMP=sign-in-ab-control&from=comments-signin'
                    );
                });
                getCommentRegisterLinks().then(links => {
                    replaceLinks(
                        links,
                        'register?INTCMP=sign-in-ab-control&from=comments-signup'
                    );
                });
            },
        },
        {
            id: 'variant',
            test: (): void => {
                getSignInLinks().then(links => {
                    replaceLinks(
                        links,
                        'signin/start?INTCMP=sign-in-ab-variant&from=topnav'
                    );
                });
                getCommentSignInLinks().then(links => {
                    replaceLinks(
                        links,
                        'signin/start?INTCMP=sign-in-ab-variant&from=comments-signin'
                    );
                });
                getCommentRegisterLinks().then(links => {
                    replaceLinks(
                        links,
                        'signin/start?INTCMP=sign-in-ab-variant&from=comments-signup'
                    );
                });
            },
        },
    ],
};
