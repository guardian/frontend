define([
    'reqwest',
    'bonzo',
    'qwery',
    'common/utils/detect',
    'common/modules/onward/history'
], function(
    reqwest,
    bonzo,
    qwery,
    detect,
    history
) {

    function fillTemplate(template, params) {
        return Object.keys(params).reduce(function(template, token) {
            return template.replace('{{' + token + '}}', params[token]);
        }, template);
    }

    return function() {

        this.id = 'FrontsMissedCard';
        this.start = '2014-02-28';
        this.expiry = '2014-03-08';
        this.author = 'Darren Hurley';
        this.description = 'Add a `You might have missed` card to the news container';
        this.audience = 0.1;
        this.audienceOffset = 0.0;
        this.successMeasure = 'Click-through for the page as a whole.';
        this.audienceCriteria = 'Users who are not on desktop or bigger, on the network front.';
        this.dataLinkNames = 'card | missed | trail | {{index}}';
        this.idealOutcome = 'Click-through for the front increases, i.e. the card does not detract from the page\'s CTR.';
        this.canRun = function(config) {
            return ['desktop', 'wide'].indexOf(detect.getBreakpoint()) > -1 && config.page.isFront && config.page.pageId === '';
        };
        this.variants = [
            {
                id: 'control',
                test: function(context, config) { }
            },
            {
                id: 'missed',
                test: function (context, config) {
                    reqwest({
                        url: 'http://content.guardianapis.com/search?tag=tone%2Freviews%2Cculture%2Fculture&page-size=3&show-fields=starRating',
                        type: 'jsonp'
                    })
                        .then(function(resp) {
                        });
                }
            }
        ];
    };
});
