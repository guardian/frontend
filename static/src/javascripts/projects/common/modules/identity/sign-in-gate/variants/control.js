// @flow
import mediator from 'lib/mediator';
import type { CurrentABTest, SignInGateVariant } from '../types';
import { component, componentName } from '../component';
import {
    hasUserDismissedGate,
    isNPageOrHigherPageView,
    isLoggedIn,
    isInvalidArticleType,
    isInvalidSection,
    addOpinionBgColour,
    addPillarColour,
    addClickHandler,
    setUserDismissedGate,
    showGate,
} from '../helper';

// define the variant name here
const name = 'control';

// add the html template as the return of the function below
// signInUrl - parameter which holds the link to the sign in/register page with the tracking parameters added
// guUrl - url of the STAGE frontend site, e.g. in DEV stage it would be https://m.thegulocal.com,
//         and for PROD it would be https://theguardian.com
const htmlTemplate: ({
    signInUrl: string,
    guUrl: string,
}) => string = ({ signInUrl, guUrl }) => `
<div class="signin-gate">
    <div class="signin-gate__content">
        <div class="signin-gate__header">
            <h1 class="signin-gate__header--text">Sign in and continue<br />reading for free</h1>
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
            <a class="signin-gate__padding-left signin-gate__link signin-gate__center-424 js-signin-gate__why" href="${guUrl}/help/identity-faq">Why sign in?</a>
            <a class="signin-gate__dismiss js-signin-gate__dismiss" href="#maincontent">Not Now</a>
        </div>
    </div>
</div>
`;

// method which returns a boolean determining if this variant can be shown on the current pageview
const canShow: () => boolean = () =>
    !hasUserDismissedGate({
        componentName,
        componentId: component.id,
        variant: name,
    }) &&
    isNPageOrHigherPageView(2) &&
    !isLoggedIn() &&
    !isInvalidArticleType() &&
    !isInvalidSection();

// method which runs if the canShow method returns true, used to display the gate and logic associated with it
// it returns a boolean, since the sign in gate is based on a `Banner` type who's show method returns a Promise<boolean>
// in our case it returns true if the method ran successfully, and false if there were any problems encountered
const show: ({
    abTest: CurrentABTest,
    guUrl: string,
    signInUrl: string,
}) => boolean = ({ abTest, guUrl, signInUrl }) =>
    showGate({
        template: htmlTemplate({
            signInUrl,
            guUrl,
        }),
        handler: ({ articleBody, shadowArticleBody }) => {
            // check if comment, and add comment/opinion bg colour
            addOpinionBgColour({
                element: shadowArticleBody,
                selector: '.signin-gate__first-paragraph-overlay',
            });

            // check page type/pillar to change text colour of the sign in gate
            addPillarColour({
                element: shadowArticleBody,
                selector: '.signin-gate__benefits--text',
            });

            // add click handler for the dismiss of the gate
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__dismiss',
                abTest,
                component,
                value: 'not-now',
                callback: () => {
                    // show the current body. Remove the shadow one
                    articleBody.style.display = 'block';
                    shadowArticleBody.remove();

                    // Tell other things the article has been redisplayed
                    mediator.emit('page:article:redisplayed');

                    // user pref dismissed gate
                    setUserDismissedGate({
                        componentName,
                        name: abTest.name,
                        variant: abTest.variant,
                    });
                },
            });

            // add click handler for sign in button click
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__button',
                abTest,
                component,
                value: 'sign-in-link',
            });

            // add click handler for the why sign in link
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__why',
                abTest,
                component,
                value: 'why-link',
            });
        },
    });

// export the variant as a SignInGateVariant type
export const signInGateVariant: SignInGateVariant = {
    name,
    canShow,
    show,
};
