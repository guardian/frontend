define([
    'reqwest',
    'bonzo',
    'qwery',
    'common/utils/detect',
    'common/utils/get-property'
], function(
    reqwest,
    bonzo,
    qwery,
    detect,
    getProperty
) {

    function fillTemplate(template, params) {
        return Object.keys(params).reduce(function(template, token) {
            return template.replace('{{' + token + '}}', params[token]);
        }, template);
    }

    return function() {

        this.id = 'FrontsCartoonCard';
        this.start = '2014-02-28';
        this.expiry = '2014-03-08';
        this.author = 'Darren Hurley';
        this.description = 'Add a cartoon card to the Comment and Debate container';
        this.audience = 0.1;
        this.audienceOffset = 0.1;
        this.successMeasure = 'Click-through for the page as a whole.';
        this.audienceCriteria = 'Users who are not on desktop or bigger, on the network front.';
        this.dataLinkNames = 'card | cartoon';
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
                id: 'cartoon',
                test: function (context, config) {
                    reqwest({
                        url: 'http://content.guardianapis.com/search?tag=theguardian%2Fseries%2Fguardiancommentcartoon&page-size=1&show-fields=all',
                        type: 'jsonp'
                    })
                        .then(function(resp) {
                            var $card = getProperty(resp, 'response.results', [])
                                    .map(function(result) {
                                        return bonzo(bonzo.create(
                                            fillTemplate(
                                                '<div class="container__card tone-comment tone-border" data-link-name="card | cartoon">' +
                                                    '<h3 class="container__card__title tone-colour">Cartoon</h3>' +
                                                    '<a href="{{url}}" data-link-name="article" class="card__item__link">' +
                                                        '<h4 class="card__item__title">{{headline}}</h4>' +
                                                        '<img src="{{thumbnail}}" alt="" width="140" height="84" class="card__item__image" />' +
                                                    '</a>' +
                                                '</div>',
                                                {
                                                    headline: result.webTitle,
                                                    url: result.webUrl.replace(/https?:\/\/[^/]*/, ''),
                                                    thumbnail: result.fields.thumbnail
                                                }
                                            )
                                        ));
                                    })
                                    .shift()
                                    .appendTo(qwery('.container--commentanddebate').shift()),
                                yPosition = 379 - $card.dim().height;
                            $card.css('top', yPosition + 'px');
                        });
                }
            }
        ];
    };
});
