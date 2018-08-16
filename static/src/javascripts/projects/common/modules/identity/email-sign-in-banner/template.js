// @flow
import type { Campaign } from './campaigns';

export type Params = {
    signInLink: string,
    emailPrefsLink: string,
    campaign: Campaign,
};

export const messageCode: string = 'email-sign-in-banner';

export const make = (params: Params): string =>
    `<div class="site-message--email-sign-in-banner-slide">
        <h3 class="site-message--email-sign-in-banner-title">
            Enjoying ${params.campaign.name}?
         </h3>
         <p class="site-message--email-sign-in-banner-text">
            We want to help you find more newsletters you'll love. If you sign in we can suggest you newsletters tailored to your personal taste. And you can manage your preferences at any time.
         </p>
         <a data-link-name="${messageCode} : to-sign-in" data-link-name="${messageCode} : success" class="site-message--email-sign-in-banner-cta">
            Sign in / Register
         </a>
         <p class="site-message--email-sign-in-banner-text">
            Free. Takes a minute. 
         </p>
    </div>`;
