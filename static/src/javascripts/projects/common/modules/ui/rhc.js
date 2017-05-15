// @flow
import $ from 'lib/$';
import bonzo from 'bonzo';

const addComponent = (content: Element, importance: number = 1) => {
    const $rhc = $('.js-components-container');
    const classname = 'component--rhc';
    let $cs;

    return $.create(
        `<div class="${classname}" data-importance="${importance}"></div>`
    )
        .append(content)
        .each(container => {
            $cs = $(`.${classname}`, $rhc[0]);
            const inferior = $cs.filter(
                component =>
                    !component.hasAttribute('data-importance') ||
                    importance >
                        parseInt(component.getAttribute('data-importance'), 10)
            );
            if (inferior.length === 0) {
                $rhc.append(container);
            } else {
                bonzo(inferior[0]).before(container);
            }
        });
};

export { addComponent };
