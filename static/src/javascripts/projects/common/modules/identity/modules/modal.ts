
import fastdom from "lib/fastdom-promise";

const ERR_MODAL_NOT_FOUND = 'Modal not found';
const ERR_MODAL_MALFORMED = 'Modal is malformed';

const bindCloserOnce = (modalEl: HTMLElement): Promise<void[]> => fastdom.read(() => Array.from(modalEl.querySelectorAll('.js-identity-modal__closer'))).then(buttonEls => buttonEls.filter(buttonEl => !buttonEl.dataset.closeIsBound).map(buttonEl => fastdom.write(() => {
  buttonEl.dataset.closeIsBound = true;
  buttonEl.addEventListener('click', () => {
    modalEl.classList.remove('identity-modal--active');
  });
}))).then(_ => Promise.all(_));

const getModal = (name: string): Promise<HTMLElement> => fastdom.read(() => {
  const modalEl: HTMLElement | null | undefined = document.querySelector(`.identity-modal.identity-modal--${name}`);
  if (!modalEl) throw new Error(ERR_MODAL_NOT_FOUND);
  return modalEl;
}).then(modalEl => bindCloserOnce(modalEl).then(() => modalEl));

const getContents = (name: string): Promise<HTMLElement> => getModal(name).then(modalEl => fastdom.read(() => {
  const contentsEl: HTMLElement | null | undefined = modalEl.querySelector(`.identity-modal__content`);
  if (!contentsEl) throw new Error(ERR_MODAL_MALFORMED);
  return contentsEl;
}));

const show = (name: string): Promise<void> => getModal(name).then(modalEl => fastdom.read(() => {
  modalEl.classList.add('identity-modal--active');
}));

const hide = (name: string): Promise<void> => getModal(name).then(modalEl => fastdom.read(() => {
  modalEl.classList.remove('identity-modal--active');
}));

export { hide, show, getContents };