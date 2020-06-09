// @flow
import mediator from 'lib/mediator';
import type { CurrentABTest } from '../../types';
import { componentName, withComponentId } from '../../component';
import {
    addOpinionBgColour,
    addClickHandler,
    setUserDismissedGate,
    showGate,
    showPrivacySettingsCMPModule,
    addOverlayVariantCSS,
    setGatePageTargeting,
} from '../../helper';

// add the html template as the return of the function below
// signInUrl - parameter which holds the link to the sign in/register page with the tracking parameters added
// guUrl - url of the STAGE frontend site, e.g. in DEV stage it would be https://m.thegulocal.com,
//         and for PROD it would be https://theguardian.com
const htmlTemplate: ({
    signInUrl: string,
    guUrl: string,
}) => string = ({ signInUrl, guUrl }) => `
<div class="signin-gate">
    <div class="signin-gate__content--var">
        <div class="signin-gate__header--var">
            <h1 class="signin-gate__header--text--var">Register for free and <br>continue reading</h1>
        </div>
        <div class="signin-gate__benefits--var signin-gate__margin-top--var">
            <p class="signin-gate__benefits--text--var">
                It’s important to say this is not a step towards a paywall
            </p>
        </div>
        <div class="signin-gate__paragraph--var">
            <p class="signin-gate__paragraph--text--var">
               We need more readers to register with us to help sustain our independent, quality journalism. Without you taking this simple step, we miss out on revenues from personalised advertising – a critical source of funding for our future.
            </p>
            <p class="signin-gate__paragraph--text--var">
               Through doing so, you’ll help ensure that our reporting remains freely available to everyone, and if we recognise you when you come back, we can improve your news experience too.
               You can still control your own <a id="js-signin-gate__privacy" class="signin-gate__link--var">privacy settings</a>. Thank you.
            </p>
        </div>
        <div class="signin-gate__buttons">
            <a class="signin-gate__button signin-gate__button--primary--var js-signin-gate__register-button" href="${signInUrl}">
                Register for free
            </a>
            <button class="signin-gate__dismiss--var js-signin-gate__dismiss" href="">I’ll do it later</button>
        </div>
        <div class="signin-gate__benefits--var signin-gate__margin-top--var">
         <p class="signin-gate__benefits--text--var">
            Have a subscription? Made a contribution? Already registered?
        </p>
            <a class="signin-gate__link--var signin-gate__signin--var js-signin-gate__sign-in signin-gate__link-no-ptm signin-gate__center-424" href="${signInUrl}">Sign in</a>
        </div>
        <div class="signin-gate__faqlinks--var signin-gate__margin-top--var">
        <div class="signin-gate__faqlinks--fullwidth--var"></div>

            <div class="signin-gate__buttons">
                <a class="signin-gate__link--var js-signin-gate__why" href="${guUrl}/membership/2019/dec/20/signing-in-to-the-guardian">Why register & how does it help?</a>
            </div>
            <div class="signin-gate__buttons">
                <a class="signin-gate__link--var js-signin-gate__how" href="${guUrl}/info/2014/nov/03/why-your-data-matters-to-us-full-text">How will my information & data be used?</a>
            </div>
            <div class="signin-gate__buttons">
                <a class="signin-gate__link--var js-signin-gate__help" href="${guUrl}/help/identity-faq">Get help with registering or signing in</a>
            </div>
        </div>
    </div>
</div>
`;

// method which runs if the canShow method from the test returns true, used to display the gate and logic associated with it
// it returns a boolean, since the sign in gate is based on a `Banner` type who's show method returns a Promise<boolean>
// in our case it returns true if the design ran successfully, and false if there were any problems encountered
export const designShow: ({
    abTest: CurrentABTest,
    guUrl: string,
    signInUrl: string,
    ophanComponentId: string,
}) => boolean = ({ abTest, guUrl, signInUrl, ophanComponentId }) =>
    showGate({
        template: htmlTemplate({
            signInUrl,
            guUrl,
        }),
        handler: ({ articleBody, shadowArticleBody }) => {
            addOverlayVariantCSS({
                element: shadowArticleBody,
                selector: '.signin-gate__first-paragraph-overlay',
            });

            // check if comment, and add comment/opinion bg colour
            addOpinionBgColour({
                element: shadowArticleBody,
                selector: '.signin-gate__first-paragraph-overlay',
            });

            const ophanComponent: OphanComponent = withComponentId(
                ophanComponentId
            );

            // add click handler for the dismiss of the gate
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__dismiss',
                abTest,
                component: ophanComponent,
                value: 'not-now',
                callback: () => {
                    // reposition window to top of page without affecting browser's 'back' navigation
                    const maincontent = document.getElementById('maincontent');
                    if (maincontent) maincontent.scrollIntoView(true);

                    // show the current body. Remove the shadow one
                    articleBody.style.display = 'block';
                    shadowArticleBody.remove();

                    // The page does not reload when a user dismisses the gate,
                    // so we must reset page targeting params dynamically via googletags
                    setGatePageTargeting(false);

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

            // add click handler for sign in link click
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__register-button',
                abTest,
                component: ophanComponent,
                value: 'register-link',
            });

            // add click handler for sign in link click
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__sign-in',
                abTest,
                component: ophanComponent,
                value: 'sign-in-link',
            });

            // add click handler for the why sign in link
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__why',
                abTest,
                component: ophanComponent,
                value: 'why-link',
            });

            // add click handler for the how info used link
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__how',
                abTest,
                component: ophanComponent,
                value: 'how-link',
            });

            // add click handler for the help link
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__help',
                abTest,
                component: ophanComponent,
                value: 'help-link',
            });

            // add click handler for the privacy settings link
            // to show the consent management platform module
            addClickHandler({
                element: shadowArticleBody,
                selector: '#js-signin-gate__privacy',
                abTest,
                component: ophanComponent,
                value: 'privacy-settings-link',
                callback: showPrivacySettingsCMPModule,
            });
        },
    });
