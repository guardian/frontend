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
            Upsell copy
         </p>
         <a data-link-name="${messageCode} : to-sign-in" data-link-name="${messageCode} : success" class="site-message--email-sign-in-banner-cta">
            Continue
         </a>
         <p class="site-message--email-sign-in-banner-text">
            If you already have an account you will enjoy a more personal Guardian experience
         </p>
    </div>`;
