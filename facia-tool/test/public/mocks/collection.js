define([
    'underscore',
    'utils/mediator'
], function (
    _,
    mediator
) {
    var all = {};

    $.mockjax({
        url: /collection\/(.+)/,
        urlParams: ['collection'],
        type: 'get',
        response: function (req) {
            this.responseText = all[req.urlParams.collection];
        },
        onAfterComplete: function () {
            mediator.emit('mock:collection');
        }
    });

    return {
        set: function (collections) {
            all = _.extend(all, collections);
        }
    };
});
