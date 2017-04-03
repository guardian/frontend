define([
    'bean',
    'qwery',
    'lib/$',
    'lib/config'
], function (
    bean,
    qwery,
    $,
    config
) {
    return function () {
        this.id = 'PaidCardLogo';
        this.start = '2017-04-03';
        this.expiry = '2017-05-05';
        this.author = 'Lydia Shepherd';
        this.description = 'Paid cards in editorial containers - trial with and without logo';
        this.showForSensitive = true;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = 'One or both versions of this card perform measurably better than an MPU';
        this.hypothesis = '';

        this.canRun = function () {
            return config.page.pageId === "uk/lifeandstyle" && !!qwery(".adverts--within-unbranded").length;
        };

        this.completeFunc = function(complete) {
            $('.adverts--within-unbranded').each(function(el){
                el.addEventListener('click', complete);
            });
        };

        this.variants = [
            {
                id: 'with-logo',
                test: function () {},
                success: this.completeFunc
            },
            {
                id: 'without-logo',
                test: function () {
                    $('.adverts--within-unbranded').each(function(el){
                        el.classList.add('without-sponsor-logo');
                    });
                },
                success: this.completeFunc
            }
        ];
    };
});
