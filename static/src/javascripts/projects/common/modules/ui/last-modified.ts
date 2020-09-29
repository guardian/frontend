

import fastdom from "lib/fastdom-promise";

const lastModified = (): void => {
  fastdom.read(() => ({
    lastModifiedElm: document.querySelector('.js-lm'),
    webPublicationDateElm: document.querySelector('.js-wpd')
  })).then(els => {
    const {
      lastModifiedElm,
      webPublicationDateElm
    } = els;

    if (lastModifiedElm && webPublicationDateElm) {
      fastdom.write(() => {
        webPublicationDateElm.classList.add('content__dateline-wpd--modified');
      });

      webPublicationDateElm.addEventListener('click', () => {
        fastdom.write(() => {
          lastModifiedElm.classList.toggle('u-h');
        });
      });
    }
  });
};

export { lastModified };