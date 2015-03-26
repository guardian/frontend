define([
    'common/utils/detect',
    'common/utils/config'
], function (
    detection,
    config
) {
    return function () {
        this.id = 'Heatmap';
        this.start = '2015-03-24';
        this.expiry = '2015-03-26';
        this.author = 'Ken Lim';
        this.description = 'US network front desktop heatmap';
        this.audience = 0.01;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = '1% looking at the US front';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            var isUsNetworkFront = (config.page.edition === 'US') && config.page.pageId === 'us',
                isDesktop = detection.getBreakpoint() === 'desktop';

            return isUsNetworkFront && isDesktop;
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    setTimeout(function()
                    {
                        var a = document.createElement('script'),
                            b = document.getElementsByTagName('script')[0],
                            offset = Math.floor(new Date().getTime() / 3600000),
                            scriptSrc = '//script.crazyegg.com/pages/scripts/0030/9248.js?';

                        a.src = document.location.protocol + scriptSrc + offset;
                        a.async = true;
                        a.type = 'text/javascript';

                        window.CE_SNAPSHOT_NAME = "US Network front on Desktop";

                        b.parentNode.insertBefore(a, b);
                    }, 1);
                }
            }
        ];
    };

});
