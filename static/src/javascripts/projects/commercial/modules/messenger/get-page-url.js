const init = (register) => {
    register('get-page-url', () => window.location.origin + window.location.pathname);
};

export { init };
