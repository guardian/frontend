import type { RegisterListeners } from 'commercial/modules/messenger';

const init = (register: RegisterListeners) => {
    register(
        'get-page-url',
        () => window.location.origin + window.location.pathname
    );
};

export { init };
