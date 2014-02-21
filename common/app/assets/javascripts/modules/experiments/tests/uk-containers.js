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

    function show() {
        // remove hiding class
        $('.facia-container').removeClass('facia-container--ab');
    }

    function renderFront(frontId) {
        // hide containers
        $('.facia-container').addClass('facia-container--ab');
        ajax({
            url: '/' + frontId + '.json',
            type: 'json',
            crossOrigin: true
        })
            .then(function(resp) {
                // remove old containers, leaving the first one
                $('.container:nth-child(n+2)').remove();
                // add new containers
                $('.facia-container > *:nth-child(n+2)', bonzo.create('<div>' + resp.html + '</div>'))
                    .appendTo(qwery('.facia-container')[0]);
                // upgrade images
                mediator.emit('ui:images:upgrade');
                mediator.emit('ui:collection-show-more:add');
                mediator.emit('ui:container-toggle:add');
            })
            .fail(function(req) {
                mediator.emit('module:error', 'Failed to get uk front "' + frontId + '"', 'experiments/tests/uk-containers.js');
            })
            .always(function(req) {
                show();
            });
    }

    return function() {

        this.id = 'UkContainers';
        this.expiry = '2014-03-01';
        this.audience = 0.1;
        this.audienceOffset = 0.0;
        this.description = 'Testing different combination of containers on the UK network front';
        this.canRun = function(config) {
            return ['/pressed/uk', '/uk'].indexOf(window.location.pathname) > -1;
        };
        this.variants = [
            {
                id: 'control',
                test: function(context, config) { }
            },
            {
                id: 'uk-alpha',
                test: function (context, config) {
                    renderFront('uk-alpha');
                }
            }
        ];
    };
});
