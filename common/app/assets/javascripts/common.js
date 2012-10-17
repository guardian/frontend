define(["EventEmitter", "bonzo", "qwery", "modules/guprefs"], function (placeholder, bonzo, qwery, guprefs) {
    var mediator = new EventEmitter();
    guprefs.init(mediator);
    return {
        mediator: mediator,
        guprefs: guprefs,
        $g: function (selector, context) {
            if (context) {
                return bonzo(qwery(selector, context));
            }
            return bonzo(qwery(selector));
        }
    };
});
