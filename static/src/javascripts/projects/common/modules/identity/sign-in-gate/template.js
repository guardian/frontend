// @flow
export const make = (): string => `
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
            <a class="component-button component-button--primary component-button--hasicon-right signin-gate__button" href="https://profile.theguardian.com/signin">
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
