// @flow

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
