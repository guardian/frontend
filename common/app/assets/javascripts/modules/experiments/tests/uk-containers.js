/*global guardian */
define([
    'common/$',
    'qwery',
    'bonzo',
    'common/utils/ajax',
    'common/utils/mediator'
], function(
    $,
    qwery,
    bonzo,
    ajax,
    mediator
) {

    return function() {

        this.id = 'UkContainers';
        this.expiry = '2014-03-24';
        this.audience = 1;
        this.audienceOffset = 0.0;
        this.description = 'Testing different combination of containers on the UK network front';
        this.canRun = function(config) {
            return window.location.pathname === '/pressed/uk';
        };
        this.variants = [
            {
                id: 'control',
                test: function(context, config) {
                    // remove hiding class
                    $('.facia-container').removeClass('facia-container--ab');
                }
            },
            {
                id: 'testOne',
                test: function (context, config) {
                    ajax({
                        url: '/uk-alpha.json',
                        type: 'json',
                        crossOrigin: true
                    }).then(
                        function(response) {
                            // remove old containers
                            $('.container:nth-child(n+2)').remove();
                            // remove hiding class
                            $('.facia-container').removeClass('facia-container--ab');
                            // add new containers
                            $('.facia-container > *', bonzo.create('<div>' + response.html + '</div>'))
                                .appendTo(qwery('.facia-container')[0]);
                            mediator.emit('ui:images:upgrade');
                        },
                        function(req) {
                            // remove hiding class
                            $('.facia-container').removeClass('facia-container--ab');
                            mediator.emit('module:error', 'Failed to get uk front', 'common/modules/autoupdate.js');
                        }
                    );
                }
            }
        ];
    };
});
