// @flow

import EventEmitter from 'EventEmitter';

const app = window.guardian.app = window.guardian.app || {};

if (!app.mediator) {
    const mediator = new EventEmitter();

    // a singleton instance of EventEmitter across the app
    app.mediator = mediator;
}

export default app.mediator;
