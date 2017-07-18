// @flow
import bean from 'bean';
import fastdom from 'fastdom';

const containerSelector = '.dropdown';
const buttonCN = 'dropdown__button';
const contentCN = 'dropdown__content';

const updateAria = (container: Element): void => {
    const v: boolean = container.classList.contains('dropdown--active');
    const content = [...container.getElementsByClassName(contentCN)];
    const button = [...container.getElementsByClassName(buttonCN)];

    content.forEach((c: Element) => {
        c.setAttribute('aria-hidden', v ? 'false' : 'true');
    });

    [...content, ...button].forEach((c: Element) => {
        c.setAttribute('aria-expanded', v ? 'true' : 'false');
    });
};

const init = (): void => {
    bean.on(document.body, 'click', `.${buttonCN}`, (e: Event) => {
        const container = (e.currentTarget: any).closest(containerSelector);
        if (container) {
            fastdom.write(() => {
                container.classList.toggle('dropdown--active');
                updateAria(container);
            });
        }
    });
};

export { init };
