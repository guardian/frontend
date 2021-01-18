import loadEnhancers from './modules/loadEnhancers';

const bindAjaxFormEventOverride = (formEl) => {
    formEl.addEventListener('submit', (ev) => {
        ev.preventDefault();
    });
};

const enhanceFormAjax = () => {
    const loaders = [
        ['.js-manage-account__ajaxForm', bindAjaxFormEventOverride],
        [
            '.js-manage-account__ajaxForm-submit',
            (el) => el.remove(),
        ],
    ];
    loadEnhancers(loaders);
};

export { enhanceFormAjax };
