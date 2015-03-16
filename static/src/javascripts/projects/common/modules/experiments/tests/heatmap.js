define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'Heatmap';
        this.start = '2015-03-16';
        this.expiry = '2015-05-18';
        this.author = 'Ken Lim';
        this.description = 'UK network front heatmap';
        this.audience = 0.01;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = '1% looking at the UK front';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return (config.page.edition === 'UK') && config.page.pageId === "uk"  ;
        };


        this.variants = [
            {
                id: 'variant',
                test: function () {
                    setTimeout(function(){var a=document.createElement("script");
                    var b=document.getElementsByTagName("script")[0];
                    a.src=document.location.protocol+"//script.crazyegg.com/pages/scripts/0030/9248.js?"+Math.floor(new Date().getTime()/3600000);
                    a.async=true;a.type="text/javascript";b.parentNode.insertBefore(a,b)}, 1);
                }
            }
        ];
    };

});
