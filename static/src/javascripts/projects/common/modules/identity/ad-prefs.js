// @flow

import {addCookie, getCookie} from "lib/cookies";
import {
    bindAnalyticsEventsOnce as bindCheckboxAnalyticsEventsOnce,
} from './modules/switch';
import fastdom from 'lib/fastdom-promise';


const selector = '.js-manage-account__ad-prefs input[type=checkbox]';

const getProviderCookieName = (provider: string) => `GU_PERSONALISED_ADS_${provider.toUpperCase()}`;

const enhanceSwitch = (switchEl: HTMLInputElement): void => {

    const cookieName = getProviderCookieName(switchEl.name);
    const isEnabled = getCookie(cookieName) === 'true';
    if(isEnabled) switchEl.checked = true;

    switchEl.addEventListener('change',()=>{
        console.log(switchEl.checked)
        addCookie(cookieName, switchEl.checked, 365 * 6, true);
    })
}

const enhanceAdPrefs = (): void => {

    fastdom.read(()=>[...document.querySelectorAll(selector)]).then(
        switchEls => {
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
