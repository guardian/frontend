// @flow

import EventEmitter from 'EventEmitter';

const { app = {} } = window.guardian;

if (!app.mediator) {
    const mediator = new EventEmitter();

    // a singleton instance of EventEmitter across the app
    app.mediator = mediator;
}

export default app.mediator;
