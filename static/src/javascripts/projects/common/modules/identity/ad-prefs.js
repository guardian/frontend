// @flow

import {addCookie, getCookie} from "lib/cookies";
import {
    bindAnalyticsEventsOnce as bindCheckboxAnalyticsEventsOnce,
} from './modules/switch';
import fastdom from 'lib/fastdom-promise';

const selector = '.js-manage-account__ad-prefs input[type=checkbox]';
const rootSelector = '.js-manage-account__ad-prefs';

const getProviderCookieName = (provider: string) => `GU_PERSONALISED_ADS_${provider.toUpperCase()}`;

const enhanceSwitch = (switchEl: HTMLInputElement): void => {

    const cookieName = getProviderCookieName(switchEl.name);
    const isEnabled = getCookie(cookieName) === 'true';
    if(isEnabled) switchEl.checked = true;

    switchEl.addEventListener('change',()=>{
        addCookie(cookieName, switchEl.checked.toString(), 365 * 6, true);
    })
}

const enhanceAdPrefs = (): void => {

    fastdom.read(()=>document.querySelectorAll(rootSelector)).then(wrapperEls=>{
        wrapperEls.forEach(_=>_.classList.remove('is-hidden'))
    });

    fastdom.read(()=>[...document.querySelectorAll(selector)]).then(
        (switchEls: HTMLInputElement[]) => {
            switchEls.forEach(switchEl => {
                enhanceSwitch(switchEl)
            });
            Promise.all(switchEls.map(_=>
                fastdom.read(()=>_.closest('.manage-account__switch'))
            )).then(switchContainerEls=>{
                switchContainerEls.filter(_=>_!==null).forEach(
                    switchContainerEl => {
                        bindCheckboxAnalyticsEventsOnce(switchContainerEl);
                    }
                )
            });

        }
    )

};

export {
    enhanceAdPrefs
};
