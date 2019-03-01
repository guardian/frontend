// @flow
import $ from 'lib/$';

const addComponent = (content: Element, importance: number = 1): void => {
    const container = $('.js-components-container');
    const classname = 'component--rhc';

    return $.create(
        `<div class="${classname}" data-importance="${importance}"></div>`
    )
        .append(content)
        .each(component => {
            const existingComponents = $(`.${classname}`, container[0]) || [];
            const inferiorComponents = Array.from(existingComponents).filter(
                existingComponent =>
                    !existingComponent.hasAttribute('data-importance') ||
                    importance >
                        parseInt(
                            existingComponent.getAttribute('data-importance'),
                            10
                        )
            );

            if (inferiorComponents.length === 0) {
                container.append(component);
            } else {
                $(inferiorComponents[0]).before(component);
            }
        });
};

export { addComponent };
