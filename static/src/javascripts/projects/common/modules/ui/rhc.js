// @flow
import $ from 'lib/$';

const addComponent = (content: Element, importance: number = 1) => {
    const $rhc = $('.js-components-container');
    const classname = 'component--rhc';

    return $.create(
        `<div class="${classname}" data-importance="${importance}"></div>`
    )
        .append(content)
        .each(container => {
            const components = $(`.${classname}`, $rhc[0]) || [];
            const inferior = Array.from(components).filter(
                component =>
                    !component.hasAttribute('data-importance') ||
                    importance >
                        parseInt(component.getAttribute('data-importance'), 10)
            );

            if (inferior.length === 0) {
                $rhc.append(container);
            } else {
                $(inferior[0]).before(container);
            }
        });
};

export { addComponent };
