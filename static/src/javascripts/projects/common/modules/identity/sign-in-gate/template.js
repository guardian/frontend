// @flow
export const make = (signInUrl: string, guUrl: string): string => `
<div class="signin-gate">
    <div class="signin-gate__content">
        <div class="signin-gate__header">
            <h1 class="signin-gate__header--text">Sign in and continue<br />reading for free</h1>
        </div>
        <div class="signin-gate__benefits syndication--bottom">
            <p class="signin-gate__benefits--text">
                Help keep our independent, progressive
                <br />
                journalism alive and thriving by taking a
                <br />
                couple of simple steps to sign in
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
