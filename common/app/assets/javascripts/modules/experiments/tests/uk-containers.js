/*global guardian */
define([
    'common/$',
    'qwery',
    'bonzo',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/modules/adverts/adverts'
], function(
    $,
    qwery,
    bonzo,
    ajax,
    mediator,
    adverts
) {

    function show() {
        // remove hiding class
        $('html').removeClass('ab-uk-containers');
    }

    function renderFront(frontId) {
        ajax({
            url: '/' + frontId + '.json',
            type: 'json',
            crossOrigin: true
        })
            .then(function(resp) {
                // remove old containers
                $('.facia-container > *').remove();
                // add new containers
                $('.facia-container > *', bonzo.create('<div>' + resp.html + '</div>'))
                    .appendTo(qwery('.facia-container')[0]);
                // upgrades images
                mediator.emit('ui:images:upgrade');
                // reload ads
                adverts.reload();
                // ui stuff
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
                test: function(context, config) {
                    show();
                }
            },
            {
                id: 'uk-alpha',
                test: function (context, config) {
                    renderFront('uk-alpha');
                }
            }
        ];
        this.always = function() {
            show();
        };
    };
});
