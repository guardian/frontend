// @flow
import type { RegisterListeners } from 'commercial-legacy/modules/messenger';
import config from 'lib/config';

const init = (register: RegisterListeners) => {
    register('get-page-targeting', () => config.get('page.sharedAdTargeting'));
};

export { init };
