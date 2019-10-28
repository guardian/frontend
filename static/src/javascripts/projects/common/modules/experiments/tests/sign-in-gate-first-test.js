// @flow
const signinUrl = 'https://profile.theguardian.com/signin';

const signInGateHTML = `
    <div class="signin-gate">
        <div class="signin-gate__content">
            <div class="signin-gate__header">
                <h2>Sign in to The Guardian</h2>
            </div>
            <ul class="signin-gate__benefits syndication--bottom">
                <li>
                    <strong>Help keep our independent journalism free</strong>
                    <br />
                    The Guardian benefits from its users being signed in
                </li>
                <li>
                    <strong>It's quick, easy and <u>free</u> to sign in</strong>
                </li>
                <li>
                    <strong>Fighting for a better world together</strong>
                    <br />
                    Knowing more about our readers means we can improve the
                    journalism and experience
                </li>
            </ul>
            <div class="signin-gate__buttons">
                <a class="component-button component-button--primary component-button--hasicon-right signin-gate__button" href="${signinUrl}">
                    Sign in free
                    <svg class="svg-arrow-right-straight" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 17.89" preserveAspectRatio="xMinYMid" aria-hidden="true" focusable="false" >
                        <path d="M20 9.35l-9.08 8.54-.86-.81 6.54-7.31H0V8.12h16.6L10.06.81l.86-.81L20 8.51v.84z" />
                    </svg>
                </a>
                <a class="signin-gate__dismiss">No thanks</a>
            </div>
        </div>
    </div>
`;

export const signInGateFirstTest: ABTest = {
    id: 'SignInGateFirstTest',
    start: '2019-10-18',
    expiry: '2019-12-17',
    author: 'Mahesh Makani, Domoinic Kendrick',
    description:
        'Test adding a sign in component on the 2nd pageview of simple article templates',
    audience: 0.01,
    audienceOffset: 0.9,
    successMeasure: 'Users sign in or create a Guardian account',
    audienceCriteria:
        'The contributions epic is not shown, The consent banner is not shown, The contributions banner is not shown, Should only appear on simple article template, Should not show if they are already signed in, Users will not need to go through the marketing consents as part of signup flow',
    dataLinkNames: 'n/a',
    idealOutcome: '60% of users sign in, and bounce rate is below 40%',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: (): void => {},
        },
        {
            id: 'variant',
            test: (): void => {
                // get the whole article body
                const articleBody = document.querySelector('.js-article__body');

                if (articleBody) {
                    // copy article body html string representation into memory
                    // const currentContent = articleBody.innerHTML;

                    // get the first paragraph of the article
                    const articleBodyFirstChild = articleBody.firstElementChild;
                    if (articleBodyFirstChild) {
                        // set the new article body to be first paragraph with transparent overlay, with the sign in gate component
                        articleBody.innerHTML = `
                            <div class="signin-gate__first-paragraph-container">
                                ${articleBodyFirstChild.outerHTML}
                                <div class="signin-gate__first-paragraph-overlay"></div>
                            </div>
                            ${signInGateHTML}
                        `;
                    }
                }
            },
        },
    ],
};
