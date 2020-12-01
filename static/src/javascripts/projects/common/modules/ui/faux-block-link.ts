

import bean from "bean";
import fastdom from "fastdom";

const overlaySelector = '.u-faux-block-link__overlay';
const hoverStateClassName = 'u-faux-block-link--hover';

const showIntentToClick = (e: Event): void => {
  fastdom.mutate(() => {
    if ((e.currentTarget as any).parentElement) {
      (e.currentTarget as any).parentElement.classList.add(hoverStateClassName);
    }
  });
};

const removeIntentToClick = (e: Event): void => {
  fastdom.mutate(() => {
    if ((e.currentTarget as any).parentElement) {
      (e.currentTarget as any).parentElement.classList.remove(hoverStateClassName);
    }
  });
};

const fauxBlockLink = (): void => {
  // mouseover
  bean.on(document.body, 'mouseenter', overlaySelector, showIntentToClick);
  // mouseout
  bean.on(document.body, 'mouseleave', overlaySelector, removeIntentToClick);
};

export { fauxBlockLink };