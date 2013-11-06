/*global guardian */
define([
    'common',
    'ajax',
    'qwery',
    'bonzo',
    'modules/detect',
    'modules/commercial/commercial-components'
], function (
    common,
    ajax,
    qwery,
    bonzo,
    detect,
    CommercialComponents) {

    var CommercialComponentsTest = function () {

        var _config;

        this.id = 'CommercialComponents';
        this.expiry = '2013-11-30';
        this.audience = 0; // Disabled for the initial trials
        this.description = 'Test new commercial components';
        this.canRun = function(config) {
            _config = config;
            return config.page.contentType === 'Article';
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

        var slotTargets = {
            ".article__main-column": "/commercial/travel/offers?" + opts.keywordsParams + "&" + opts.userSegments,
            ".js-mpu-ad-slot":       "/commercial/masterclasses?" + opts.keywordsParams
        };

        Object.keys(slotTargets).forEach(function(selector) {
            var $slot   = common.$g(selector, opts.context),
                urlPath = slotTargets[selector];

            if ($slot) {
                ajax({
                    url: urlPath,
                    type: 'html',
                    method: 'get',
                    crossOrigin: true,
                    success: function(response) {
                        $slot.append(response);
                        common.mediator.emit('modules:commercial:loaded');
                    }
                });
            }
        });
    }

    return CommercialComponentsTest;

});
