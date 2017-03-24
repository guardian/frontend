define([
    'lib/mediator'
], function (
    mediator
) {
    return function () {
        if (window.matchMedia) {
            var mql = window.matchMedia('print');
            mql.addListener(function () {
                if (mql.matches) {
                    mediator.emit('module:clickstream:interaction', 'print');
                }
            });
        }
    };
});
