import fastdom from 'lib/fastdom-promise';

const ERR_MODAL_NOT_FOUND = 'Modal not found';
const ERR_MODAL_MALFORMED = 'Modal is malformed';

const bindCloserOnce = (modalEl) =>
    fastdom
        .measure(() =>
            Array.from(modalEl.querySelectorAll('.js-identity-modal__closer'))
        )
        .then(buttonEls =>
            buttonEls
                .filter(buttonEl => !buttonEl.dataset.closeIsBound)
                .map(buttonEl =>
                    fastdom.mutate(() => {
                        buttonEl.dataset.closeIsBound = true;
                        buttonEl.addEventListener('click', () => {
                            modalEl.classList.remove('identity-modal--active');
                        });
                    })
                )
        )
        .then(_ => Promise.all(_));

const getModal = (name) =>
    fastdom
        .measure(() => {
            const modalEl = document.querySelector(
                `.identity-modal.identity-modal--${name}`
            );
            if (!modalEl) throw new Error(ERR_MODAL_NOT_FOUND);
            return modalEl;
        })
        .then(modalEl => bindCloserOnce(modalEl).then(() => modalEl));

const getContents = (name) =>
    getModal(name).then(modalEl =>
        fastdom.measure(() => {
            const contentsEl = modalEl.querySelector(
                `.identity-modal__content`
            );
            if (!contentsEl) throw new Error(ERR_MODAL_MALFORMED);
            return contentsEl;
        })
    );

const show = (name) =>
    getModal(name).then(modalEl =>
        fastdom.measure(() => {
            modalEl.classList.add('identity-modal--active');
        })
    );

const hide = (name) =>
    getModal(name).then(modalEl =>
        fastdom.measure(() => {
            modalEl.classList.remove('identity-modal--active');
        })
    );

export { hide, show, getContents };
