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

        this.id = 'FrontsLatestReviewsCard';
        this.start = '2014-03-17';
        this.expiry = '2014-03-24';
        this.author = 'Darren Hurley';
        this.description = 'Add a latest reviews card to the features container';
        this.audience = 0.4;
        this.audienceOffset = 0.4;
        this.successMeasure = 'Click-through for the page as a whole.';
        this.audienceCriteria = 'Users who are not on desktop or bigger, on the network front.';
        this.dataLinkNames = 'card | latest reviews | trail | {{index}}';
        this.idealOutcome = 'Click-through for the front increases, i.e. the card does not detract from the page\'s CTR.';
        this.canRun = function(config) {
            return ['desktop', 'wide'].indexOf(detect.getBreakpoint()) > -1 && /^\w{2}-alpha$/.test(config.page.pageId);
        };
        this.variants = [
            {
                id: 'control',
                test: function() { }
            },
            {
                id: 'latest-reviews',
                test: function () {
                    ajax({
                        url        : '/tagged.json?tag=tone/reviews,culture/culture',
                        type       : 'json',
                        crossOrigin: true
                    })
                        .then(function(resp) {
                            var reviews = getProperty(resp, 'trails', [])
                                .map(function(result, index) {
                                    return template(
                                        '<li data-link-name="trail | {{index}}" class="card__item">' +
                                            '<a href="{{url}}" class="card__item__link" data-link-name="article">' +
                                                '<h4 class="card__item__title">{{section}}: {{headline}}</h4>' +
                                                ((result.starRating !== null) ?
                                                    '<span class="stars s-{{rating}}" itemprop="reviewRating" itemscope itemtype="http://schema.org/Rating">' +
                                                        '<meta itemprop="worstRating" content="1" />' +
                                                        '<span itemprop="ratingValue">{{rating}}</span> /' +
                                                        '<span itemprop="bestRating">5</span> stars' +
                                                    '</span>' : '') +
                                            '</a>' +
                                        '</li>',
                                        {
                                            headline: result.webTitle,
                                            url     : result.webUrl.replace(/https?:\/\/[^/]*/, ''),
                                            section : result.sectionName,
                                            rating  : result.starRating,
                                            index   : index + 1
                                        }
                                    );
                                }),
                                $card = bonzo(
                                    bonzo.create(
                                        template(
                                            '<div class="container__card tone-feature tone-accent-border" data-link-name="card | latest reviews">' +
                                                '<h3 class="container__card__title tone-colour">Latest reviews</h3>' +
                                                '<ul class="u-unstyled">{{reviews}}</ul>' +
                                            '</div>',
                                            {reviews:  reviews.join('')}
                                        )
                                    )
                                ).appendTo(qwery('.container--features').shift()),
                                yPosition = 594 - $card.dim().height;
                            $card.css('top', yPosition + 'px');
                        });
                }
            }
        ];
    };
});
