define([
    'bonzo',
    'qwery',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/get-property',
    'common/utils/template'
], function(
    bonzo,
    qwery,
    ajax,
    detect,
    getProperty,
    template
) {

    return function() {

        this.id = 'FrontsLiveCard';
        this.start = '2014-02-28';
        this.expiry = '2014-03-08';
        this.author = 'Darren Hurley';
        this.description = 'Add a live card to the news container';
        this.audience = 0.1;
        this.audienceOffset = 0.0;
        this.successMeasure = 'Click-through for the page as a whole.';
        this.audienceCriteria = 'Users who are not on desktop or bigger, on the network front.';
        this.dataLinkNames = 'card | live | trail | {{index}}';
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
                id: 'live',
                test: function (context, config) {
                    ajax({
                        url        : '/tagged.json?tag=tone/minutebyminute',
                        type       : 'json',
                        crossOrigin: true
                    })
                        .then(function(resp) {
                            var items = getProperty(resp, 'trails', []).map(function(result, index) {
                                    return template(
                                        '<li data-link-name="trail | {{index}}" class="card__item">' +
                                            '<a href="{{url}}" class="card__item__link" data-link-name="article">' +
                                                '<h4 class="card__item__title">' +
                                                    ((result.liveBloggingNow === 'true') ?
                                                        '<span class="item__live-indicator">Live</span> ' : '') +
                                                    '{{headline}}' +
                                            '   </h4>' +
                                            '</a>' +
                                        '</li>',
                                        {
                                            headline: result.webTitle,
                                            url:      result.webUrl.replace(/https?:\/\/[^/]*/, ''),
                                            index:    index + 1
                                        }
                                    );
                                }),
                                $card = bonzo(
                                    bonzo.create(
                                        template(
                                            '<div class="container__card container__card--live tone-news tone-accent-border" data-link-name="card | live">' +
                                                '<h3 class="container__card__title tone-colour">What\'s happening now</h3>' +
                                                '<ul class="u-unstyled">{{items}}</ul>' +
                                            '</div>',
                                            {
                                                items:  items.join('')
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
