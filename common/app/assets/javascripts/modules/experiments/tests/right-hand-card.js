define([
    'common',
    'modules/detect',
    'modules/experiments/right-hand-card'
], function (
    common,
    detect,
    Card
) {

    var RightHandCard = function () {

        this.id = 'RightHandCard';
        this.expiry = '2013-08-28';
        this.audience = 1;
        this.description = 'Introduce next story into card in right hand column and test impact';
        this.canRun = function(config) {
            var layoutMode = detect.getLayoutMode(),
                storyPackage = document.querySelector('.js-related') && document.querySelector('.js-related').innerHTML !== '';
            return config.page.contentType === 'Article' && storyPackage && layoutMode !== 'mobile' && layoutMode !== 'tablet';
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                    document.querySelector('.card-wrapper--right').className += ' is-hidden';
                }
            },
            {
                id: 'story-package-card',
                test: function (context) {
                    var card = new Card({
                        type: 'story-package',
                        context: context
                    });
                }
            },
            {
                id: 'most-read-card',
                test: function (context) {
                    var card = new Card({
                        type: 'most-read',
                        context: context
                    });
                }
            },
            {
                id: 'latest-card',
                test: function (context) {
                    var card = new Card({
                        type: 'latest',
                        context: context
                    });
                }
            }
        ];
    };

    return RightHandCard;

});
