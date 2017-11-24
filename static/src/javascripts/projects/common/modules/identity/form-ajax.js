// @flow
// This is a workaround for the email preferences page https://profile.thegulocal.com/email-prefs
// We want to submit subscribe/unsubscribe requests without a full page refresh
// Hopefully this will be short-lived; if it is still alive in 2017, git blame and cry

import { _ as robust } from 'lib/robust';
import fastdom from 'lib/fastdom-promise';

const bindAjaxFormEventOverride = (formEl: HTMLFormElement): void => {
    formEl.addEventListener('submit', (ev: Event) => {
        ev.preventDefault();
    });
};

const enhanceFormAjax = (): void => {
    const loaders = [
        ['.js-manage-account__ajaxForm', bindAjaxFormEventOverride],
        [
            '.js-manage-account__ajaxForm-submit',
            (el: HTMLElement) => el.remove(),
        ],
    ];

    /* ugly :any that saves a lot of loader complexity */

    loaders.forEach(([classname: string, action: Function]) =>
        fastdom
            .read(() => [...document.querySelectorAll(classname)])
            .then(elements =>
                elements.forEach((element: any) => {
                    robust.catchAndLogError(classname, () => {
                        action(element);
                    });
                })
            )
    );
};

export { enhanceFormAjax };
