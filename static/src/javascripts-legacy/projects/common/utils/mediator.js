define(['EventEmitter'], function (EventEmitter) {
    var mediator;
    var app = window.guardian.app = window.guardian.app || {};

    if (app.mediator) {
        return app.mediator;
    }

    // a singleton instance of EventEmitter across the app
    mediator = new EventEmitter();
    app.mediator = mediator;

    return mediator;
});
