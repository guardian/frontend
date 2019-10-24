// @flow strict

const signinUrl = 'blah';

const askHtml = `
<div class="signin-gate">
    <div class="signin-gate-content">
        <div class="signin-gate-header">
            <h2>Sign in to The Guardian</h2>
        </div>
        <ul class="signin-gate-benefits">
            <li>
                <strong>Help keep our independent journalism free</strong>
                <br/>
                The Guardian benefits from its users being signed in
            </li>
            <li>
                <strong>It's quick, easy and <u>free</u> to sign in</strong>
            </li>
            <li>
                <strong>Fighting for a better world together</strong>
                Knowing more about our readers means we can improve the journalism and experience
            </li>
        </ul>
        <a class="signin-gate-signin-button" href="${signinUrl}">
            <span class="signin-gate-signin-button__content">Sign in free</span>
        </a>
        <a class="signin-gate-dismiss">No thanks</a>
    </div>
</div>
`;

export const signInGateFirstTest: ABTest = {
    id: 'SignInGateFirstTest',
    start: '2019-11-18',
    expiry: '2019-12-17',
    author: 'Mahesh Makani',
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
                const slot = document.querySelector('.js-article__body');
                if (slot) {
                    slot.innerHTML += askHtml;
                }
            },
        },
    ],
};
