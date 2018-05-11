// @flow

import fastdom from 'lib/fastdom-promise';
import { bindAnalyticsEventsOnce as bindCheckboxAnalyticsEventsOnce } from './modules/switch';
import { getProviderState, setProviderState } from './ad-prefs.lib';

const checkboxSelector: string =
    '.js-manage-account__ad-prefs input[type=checkbox]';
const rootSelector: string = '.js-manage-account__ad-prefs';

const enhanceSwitch = (switchEl: HTMLInputElement): void => {
    const provider = switchEl.name;
    if (getProviderState(provider)) switchEl.checked = true;
    switchEl.addEventListener('change', () => {
        setProviderState(switchEl.name, switchEl.checked);
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
