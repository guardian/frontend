/*global guardian */
define([
    'common/$',
    'common/utils/mediator'
], function(
    $,
    mediator
    ) {

    return function() {

        this.id = 'AdLabels';
        this.expiry = '2014-02-24';
        this.audience = 0.3;
        this.audienceOffset = 0.4;
        this.description = 'Testing if putting labels next to ads impacts the CTR';
        this.canRun = function(config) {
            console.log("Run add labels");
            return config.page.contentType === 'Article' && config.switches.adverts;
        };
        this.variants = [
            {
                id: 'control',
                test: function(context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha1.com';
                }
            },
            {
                id: 'ShowAdLabels',
                test: function (context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha2.com';

                    $('.ad-slot').addClass('ad-slot__show-label');

                    // Re-apply the class when ads are reloaded on window resize
                    mediator.on('modules:adverts:reloaded', function() {
                        $('.ad-slot').addClass('ad-slot__show-label');
                    });

                    // Add class to bottom to fix local nav layout bug
                    $('html').addClass('ab__ad-labels');
                }
            }
        ];
    };
});
