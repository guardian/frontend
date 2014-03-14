define([
    'bonzo',
    'qwery',
    'common/utils/ajax',
    'common/utils/detect',
    'common/modules/onward/history',
    'common/utils/get-property',
    'common/utils/template'
], function(
    bonzo,
    qwery,
    ajax,
    detect,
    History,
    getProperty,
    template
) {

    var editionMappings = {
        'UK': 'GB',
        'US': 'US',
        'AU': 'AU'
    };

    return function() {

        this.id = 'FrontsMissedCard';
        this.start = '2014-03-14';
        this.expiry = '2014-03-21';
        this.author = 'Darren Hurley';
        this.description = 'Add a `You might have missed` card to the news container';
        this.audience = 0.25;
        this.audienceOffset = 0.75;
        this.successMeasure = 'Click-through for the page as a whole.';
        this.audienceCriteria = 'Users who are not on desktop or bigger, on the network front.';
        this.dataLinkNames = 'card | missed | trail | {{index}}';
        this.idealOutcome = 'Click-through for the front increases, i.e. the card does not detract from the page\'s CTR.';
        this.canRun = function(config) {
            return ['desktop', 'wide'].indexOf(detect.getBreakpoint()) > -1 && /^\w{2}-alpha$/.test(config.page.pageId);
        };
        this.variants = [
            {
                id: 'control',
                test: function(context, config) { }
            },
            {
                id: 'missed',
                test: function (context, config) {
                    ajax({
                        url        : '/most-read-day.json?countryCode=' + editionMappings[config.page.edition],
                        type       : 'json',
                        crossOrigin: true
                    })
                        .then(function(resp) {
                            var history = new History(),
                                articles = getProperty(resp, 'trails', [])
                                    .filter(function(article) {
                                        return !history.contains('/' + article.id);
                                    })
                                    .slice(0, 3)
                                    .map(function(article, index) {
                                        return template(
                                            '<li data-link-name="trail | {{index}}" class="card__item">' +
                                                '<a href="{{url}}" class="card__item__link" data-link-name="article">' +
                                                    '<h4 class="card__item__title">{{headline}}</h4>' +
                                                '</a>' +
                                            '</li>',
                                            {
                                                headline: article.headline,
                                                url     : article.url,
                                                index   : index + 1
                                            }
                                        );
                                    }),
                                $card = bonzo(
                                    bonzo.create(
                                        template(
                                            '<div class="container__card container__card--missed tone-news tone-accent-border" data-link-name="card | missed">' +
                                                '<h3 class="container__card__title tone-colour">You may have missed</h3>' +
                                                '<ul class="u-unstyled">{{articles}}</ul>' +
                                            '</div>',
                                            {
                                                articles:  articles.join('')
                                            }
                                        )
                                    )
                                ).appendTo(qwery('.container--news').shift()),
                                yPosition = 944 - $card.dim().height;
                            $card.css('top', yPosition + 'px');
                        });
                }
            }
        ];
    };
});
