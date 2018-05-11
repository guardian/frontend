// @flow

import { addCookie, getCookie } from 'lib/cookies';
import fastdom from 'lib/fastdom-promise';
import { bindAnalyticsEventsOnce as bindCheckboxAnalyticsEventsOnce } from './modules/switch';

const checkboxSelector: string =
    '.js-manage-account__ad-prefs input[type=checkbox]';
const rootSelector: string = '.js-manage-account__ad-prefs';

const getProviderCookieName = (provider: string): string =>
    `GU_PERSONALISED_ADS_${provider.toUpperCase()}`;

const enhanceSwitch = (switchEl: HTMLInputElement): void => {
    const cookieName = getProviderCookieName(switchEl.name);
    const isEnabled = getCookie(cookieName) === 'true';
    if (isEnabled) switchEl.checked = true;

    switchEl.addEventListener('change', () => {
        addCookie(cookieName, switchEl.checked.toString(), 365 * 6, true);
    });
};

const enhanceAdPrefs = (): void => {
    fastdom
        .read(() => document.querySelectorAll(rootSelector))
        .then((wrapperEls: HTMLElement[]) => {
            wrapperEls.forEach(_ => _.classList.remove('is-hidden'));
        });

    fastdom
        .read(() => [...document.querySelectorAll(checkboxSelector)])
        .then((switchEls: HTMLInputElement[]) => {
            switchEls.forEach(switchEl => {
                enhanceSwitch(switchEl);
            });
            Promise.all(
                switchEls.map(_ =>
                    fastdom.read(() => _.closest('.manage-account__switch'))
                )
            )
                .then(rawSwitchContainerEls =>
                    rawSwitchContainerEls.filter(_ => _ !== null)
                )
                .then((switchContainerEls: HTMLElement[]) => {
                    switchContainerEls.forEach(switchContainerEl => {
                        bindCheckboxAnalyticsEventsOnce(switchContainerEl);
                    });
                });
        });
};

export { enhanceAdPrefs };
