// @flow
const variant: ({
    signInUrl: string,
    guUrl: string,
}) => string = ({ signInUrl, guUrl }) => `
<div class="signin-gate">
    <div class="signin-gate__content">
        <div class="signin-gate__header">
            <h1 class="signin-gate__header--text">Sign in and continue<br />reading for free - VARIANT</h1>
        </div>
        <div class="signin-gate__benefits syndication--bottom">
            <p class="signin-gate__benefits--text">
                Help keep our independent, progressive journalism alive and thriving by taking a couple of simple steps to sign in
            </p>
        </div>
        <div class="signin-gate__buttons">
            <a class="signin-gate__button signin-gate__button--primary js-signin-gate__button" href="${signInUrl}">
                Sign in
            </a>
            <a class="signin-gate__why js-signin-gate__why" href="${guUrl}/help/identity-faq">Why sign in?</a>
            <a class="signin-gate__dismiss js-signin-gate__dismiss" href="#maincontent">Not Now</a>
        </div>
    </div>
</div>
`;

const control: ({
    signInUrl: string,
    guUrl: string,
}) => string = ({ signInUrl, guUrl }) => `
<div class="signin-gate">
    <div class="signin-gate__content">
        <div class="signin-gate__header">
            <h1 class="signin-gate__header--text">Sign in and continue<br />reading for free - CONTROL</h1>
        </div>
        <div class="signin-gate__benefits syndication--bottom">
            <p class="signin-gate__benefits--text">
                Help keep our independent, progressive journalism alive and thriving by taking a couple of simple steps to sign in
            </p>
        </div>
        <div class="signin-gate__buttons">
            <a class="signin-gate__button signin-gate__button--primary js-signin-gate__button" href="${signInUrl}">
                Sign in
            </a>
            <a class="signin-gate__why js-signin-gate__why" href="${guUrl}/help/identity-faq">Why sign in?</a>
            <a class="signin-gate__dismiss js-signin-gate__dismiss" href="#maincontent">Not Now</a>
        </div>
    </div>
</div>
`;

export const makeTemplate: ({
    signInUrl: string,
    guUrl: string,
    abVariant: string,
}) => string = ({ signInUrl, guUrl, abVariant }) => {
    switch (abVariant) {
        case 'control':
            return control({ signInUrl, guUrl });
        case 'variant':
            return variant({ signInUrl, guUrl });
        default:
            return ``;
    }
};
