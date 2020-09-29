

import loadEnhancers from "./modules/loadEnhancers";

const bindAjaxFormEventOverride = (formEl: HTMLFormElement): void => {
  formEl.addEventListener('submit', (ev: Event) => {
    ev.preventDefault();
  });
};

const enhanceFormAjax = (): void => {
  const loaders = [['.js-manage-account__ajaxForm', bindAjaxFormEventOverride], ['.js-manage-account__ajaxForm-submit', (el: HTMLElement) => el.remove()]];
  loadEnhancers(loaders);
};

export { enhanceFormAjax };