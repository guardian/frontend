import checkIcon from 'svgs/icon/tick.svg';
import type { Campaign } from './campaigns';

export type Params = {
    signInLink: string,
    emailPrefsLink: string,
    campaign: Campaign,
}

export type ClassNames = {
    slide1: string,
    slide2: string,
    slideHidden: string,
    toSlideTwo: string,
}

export const classNames: ClassNames = {
    slide1: 'js-site-message--email-sign-in-banner-slide--1',
    slide2: 'js-site-message--email-sign-in-banner-slide--2',
    slideHidden: 'site-message--email-sign-in-banner-slide--hidden',
    toSlideTwo: 'js-site-message--email-sign-in-banner-to-step-two',
};

export const messageCode: string = 'email-sign-in-banner';

export const make = (params: Params): string =>
    `<div class="site-message--email-sign-in-banner-slide ${classNames.slide1}">
        <h3 class="site-message--email-sign-in-banner-title">
            Enjoying ${params.campaign.name}?
         </h3>
         <p class="site-message--email-sign-in-banner-text">
            ${params.campaign.upsell}
         </p>
         <button data-link-name="${messageCode} : onwards" class="site-message--email-sign-in-banner-cta ${
        classNames.toSlideTwo
        }">
            Find your new favourite newsletter
            ${checkIcon.markup}
         </button>
    </div>
    <div class="site-message--email-sign-in-banner-slide ${classNames.slide2} ${
        classNames.slideHidden
        }">
        <h3 class="site-message--email-sign-in-banner-title">
            Use your free Guardian account to manage your newsletters.
         </h3>
         <p class="site-message--email-sign-in-banner-upsell">
            We’ll create an account for you now if you don’t already have one – it takes a moment 
          </p>
        <a data-link-name="${messageCode} : to-sign-in" class="site-message--email-sign-in-banner-cta" href="${
        params.signInLink
        }">
        Sign in / Register
        ${checkIcon.markup}
        </a>
        <p>
            <a data-link-name="${messageCode} : skip-sign-in" href="#">Browse all newsletters</a> without signing in
        </p>
    </div>`;
