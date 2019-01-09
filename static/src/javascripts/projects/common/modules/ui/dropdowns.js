// @flow
import bean from 'bean';
import fastdom from 'lib/fastdom-promise';

const containerSelector = '.dropdown';
const buttonCN = 'dropdown__button';
const contentCN = 'dropdown__content';

const updateAria = (container: Element): void => {
    const v: boolean = container.classList.contains('dropdown--active');
    const content = Array.from(container.getElementsByClassName(contentCN));
    const button = Array.from(container.getElementsByClassName(buttonCN));
    content.forEach((c: Element) => {
        c.setAttribute('aria-hidden', (!v).toString());
    });

    [...content, ...button].forEach((c: Element) => {
        c.setAttribute('aria-expanded', v.toString());
    });
};

const init = (): void => {
    bean.on(document.body, 'click', `.${buttonCN}`, (e: Event) => {
        const container = (e.currentTarget: any).closest(containerSelector);

        if (container) {
            fastdom
                .read(() => {
                    const documentElement: ?HTMLElement =
                        document.documentElement;
                    const content = container.querySelector(`.${contentCN}`);
                    const isActive: boolean = container.classList.contains(
                        'dropdown--active'
                    );
                    const isAnimated: boolean =
                        container.classList.contains('dropdown--animated') &&
                        (documentElement !== null &&
                            documentElement !== undefined &&
                            documentElement.classList.contains(
                                'disable-flashing-elements'
                            ) === false);
                    const contentEstimatedHeight =
                        content.offsetHeight !== undefined &&
                        content.offsetHeight < window.innerHeight
                            ? content.offsetHeight
                            : window.innerHeight;

                    /*
                    by clamping the transition to windowHeight we avoid
                    a very awkward effect where a long list doesn't really
                    get any visual closing feedback in the first milliseconds
                    because its starting to close from the bottom, which is off-screen
                    */

                    return {
                        content,
                        isActive,
                        isAnimated,
                        contentEstimatedHeight,
                    };
                })
                .then(
                    ({
                        content,
                        isActive,
                        isAnimated,
                        contentEstimatedHeight,
                    }) => {
                        if (isAnimated && 'ontransitionend' in window) {
                            fastdom
                                .write(() => {
                                    container.style.pointerEvents = 'none';
                                    if (!isActive) {
                                        container.classList.toggle(
                                            'dropdown--active'
                                        );
                                    }
                                    content.style.height = isActive
                                        ? `${contentEstimatedHeight}px`
                                        : 0;
                                })
                                .then(() => {
                                    requestAnimationFrame(() => {
                                        content.style.height = isActive
                                            ? 0
                                            : `${contentEstimatedHeight}px`;

                                        bean.one(
                                            content,
                                            'transitionend',
                                            () => {
                                                fastdom.write(() => {
                                                    content.style.height =
                                                        'auto';
                                                    container.style.pointerEvents =
                                                        'all';
                                                    if (isActive) {
                                                        container.classList.toggle(
                                                            'dropdown--active'
                                                        );
                                                    }
                                                    updateAria(container);
                                                });
                                            }
                                        );
                                    });
                                });
                        } else {
                            fastdom.write(() => {
                                container.classList.toggle('dropdown--active');
                                updateAria(container);
                            });
                        }
                    }
                );
        }
    });
};

export { init };
