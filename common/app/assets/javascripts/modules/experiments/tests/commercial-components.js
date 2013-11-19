/*global guardian */
define([
    'common',
    'utils/ajax',
    'qwery',
    'bonzo',
    'utils/detect',
    'utils/storage',
    'lodash/collections/find',
    'modules/commercial/commercial-components'
], function (
    common,
    ajax,
    qwery,
    bonzo,
    detect,
    storage,
    find,
    CommercialComponents) {

    var CommercialComponentsTest = function () {

        var _config;

        this.id = 'CommercialComponents';
        this.expiry = '2013-12-04';
        this.audience = 0.1;
        this.description = 'Test new commercial components';
        this.canRun = function(config) {
            _config = config;

            var isTravelRepeatVisitor = find(storage.local.get('gu.history'), function(item) {
                return item.section === 'travel';
            });

            return config.page.contentType === 'Article' && isTravelRepeatVisitor;
        };
        this.variants = [
            {
                id: 'show',
                test: function(context) {
                    var c = new CommercialComponents({
                        config: _config,
                        context: context
                    }).init();

                    loadComponents({
                        keywordsParams: c.keywordsParams,
                        userSegments: c.userSegments,
                        context: context
                    });

                    common.$g('.ad-slot--mpu-banner-ad', context).hide();

                    return true;
                }
            },
            {
                id: 'control',
                test: function() {
                    return true;
                }
            }
        ];
    };



    function loadComponents(opts) {

        var containerMapping = {
            ".js-mpu-ad-slot" : "/commercial/travel/offers.json?seg=repeat&" + opts.keywordsParams
        };

        Object.keys(containerMapping).forEach(function(selector) {
            var $slot   = common.$g(selector, opts.context),
                urlPath = containerMapping[selector];

            if ($slot) {
                ajax({
                    url: urlPath,
                    type: 'json',
                    method: 'get',
                    crossOrigin: true,
                    success: function(response) {
                        $slot.append(response.html);
                        common.mediator.emit('modules:commercial:loaded');
                    }
                });
            }
        });
    }

    return CommercialComponentsTest;

});
