/*global guardian */
define([
    'common/$',
    'qwery',
    'bonzo',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/modules/adverts/adverts',
    'common/utils/cookies',
    'require'
], function(
    $,
    qwery,
    bonzo,
    ajax,
    mediator,
    adverts,
    cookies,
    require
) {

    function show() {
        // remove hiding class
        $('html').removeClass('ab-au-containers');
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
                mediator.emit('fragment:ready:dates');
                show();
            })
            .fail(function(req) {
                mediator.emit('module:error', 'Failed to get au front "' + frontId + '"', 'experiments/tests/au-containers.js');
                show();
            });
    }

    return function() {

        this.id = 'AuContainers';
        this.expiry = '2014-03-08';
        this.audience = 0.1;
        this.audienceOffset = 0.0;
        this.description = 'Testing different combination of containers on the UK network front';
        this.canRun = function(config) {
            var onAuFront = ['/pressed/au', '/au'].indexOf(window.location.pathname) > -1;
            if (onAuFront) {
                // force user into au-alpha variant if they've clicked on the Beta link in R2
                // NOTE: requiring here to avoid circular dependency
                var ab = require('common/modules/experiments/ab');
                if (['responsive', 'mobile'].indexOf(cookies.get('GU_VIEW')) > -1 && !ab.getTestVariant(this.id)) {
                    ab.forceSegment(this.id, 'au-alpha');
                }
            }
            return onAuFront;
        };
        this.variants = [
            {
                id: 'control',
                test: function(context, config) {
                    show();
                }
            },
            {
                id: 'au-alpha',
                test: function (context, config) {
                    renderFront('au-alpha');
                }
            }
        ];
        this.notInTest = function() {
            show();
        };
    };
});
