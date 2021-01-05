import config from 'lib/config';

const init = (register) => {
    register('get-page-targeting', () => config.get('page.sharedAdTargeting'));
};

export { init };
