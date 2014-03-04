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
                // comment counts
                commentCount.init(qwery('.facia-container').shift());
                // ui stuff
                mediator.emit('ui:collection-show-more:add');
                mediator.emit('ui:container-toggle:add');
                mediator.emit('fragment:ready:dates');
                show();
            })
            .fail(function(req) {
                mediator.emit('module:error', 'Failed to get uk front "' + frontId + '"', 'experiments/tests/uk-containers.js');
                show();
            });
    }

    return function() {

        this.id = 'UkContainers';
        this.expiry = '2014-03-08';
        this.audience = 0.1;
        this.audienceOffset = 0.0;
        this.description = 'Testing different combination of containers on the UK network front';
        this.canRun = function(config) {
            var onUkFront = ['/pressed/uk', '/uk'].indexOf(window.location.pathname) > -1;
            if (onUkFront) {
                // force user into uk-alpha variant if they've clicked on the Beta link in R2
                // NOTE: requiring here to avoid circular dependency
                var ab = require('common/modules/experiments/ab');
                if (['responsive', 'mobile'].indexOf(cookies.get('GU_VIEW')) > -1 && !ab.getTestVariant(this.id)) {
                    ab.forceSegment(this.id, 'uk-alpha');
                }
            }
            return onUkFront;
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
        this.notInTest = function() {
            show();
        };
    };
});
