define([
    'bean',
    'common/utils/mediator'
], function (
    bean,
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
