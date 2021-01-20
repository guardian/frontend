import bean from 'bean';
import fastdom from 'fastdom';

const overlaySelector = '.u-faux-block-link__overlay';
const hoverStateClassName = 'u-faux-block-link--hover';

const showIntentToClick = (e) => {
    fastdom.mutate(() => {
        if ((e.currentTarget).parentElement) {
            (e.currentTarget).parentElement.classList.add(
                hoverStateClassName
            );
        }
    });
};

const removeIntentToClick = (e) => {
    fastdom.mutate(() => {
        if ((e.currentTarget).parentElement) {
            (e.currentTarget).parentElement.classList.remove(
                hoverStateClassName
            );
        }
    });
};

const fauxBlockLink = () => {
    // mouseover
    bean.on(document.body, 'mouseenter', overlaySelector, showIntentToClick);
    // mouseout
    bean.on(document.body, 'mouseleave', overlaySelector, removeIntentToClick);
};

export { fauxBlockLink };
