/*global guardian */
define([
    'common/$',
    'qwery',
    'bonzo',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/modules/adverts/adverts',
    'common/utils/cookies',
    'common/modules/discussion/comment-count',
    'require'
], function(
    $,
    qwery,
    bonzo,
    ajax,
    mediator,
    adverts,
    cookies,
    commentCount,
    require
) {

    function show() {
        // remove hiding class
        $('html').removeClass('ab-us-containers');
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
                // comment counts
                commentCount.init(qwery('.facia-container').shift());
                // ui stuff
                mediator.emit('ui:collection-show-more:add');
                mediator.emit('ui:container-toggle:add');
                mediator.emit('fragment:ready:dates');
            })
            .fail(function(req) {
                mediator.emit('module:error', 'Failed to get us front "' + frontId + '"', 'experiments/tests/us-containers.js');
            })
            .always(function(req) {
                show();
            });
    }

    return function() {

        this.id = 'UsContainers';
        this.expiry = '2014-03-08';
        this.audience = 0.1;
        this.audienceOffset = 0.0;
        this.description = 'Testing different combination of containers on the US network front';
        this.canRun = function(config) {
            var onUsFront = ['/pressed/us', '/us'].indexOf(window.location.pathname) > -1;
            if (onUsFront) {
                // force user into us-alpha variant if they've clicked on the Beta link in R2
                // NOTE: requiring here to avoid circular dependency
                var ab = require('common/modules/experiments/ab');
                if (['responsive', 'mobile'].indexOf(cookies.get('GU_VIEW')) > -1 && !ab.getTestVariant(this.id)) {
                    ab.forceSegment(this.id, 'us-alpha');
                }
            }
            return onUsFront;
        };
        this.variants = [
            {
                id: 'control',
                test: function(context, config) {
                    show();
                }
            },
            {
                id: 'us-alpha',
                test: function (context, config) {
                    renderFront('us-alpha');
                }
            }
        ];
        this.notInTest = function() {
            show();
        };
    };
});
