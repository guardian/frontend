define([
    'reqwest',
    'bonzo',
    'qwery',
    'common/utils/detect'
], function(
    reqwest,
    bonzo,
    qwery,
    detect
) {

    function fillTemplate(template, params) {
        return Object.keys(params).reduce(function(template, token) {
            return template.replace('{{' + token + '}}', params[token]);
        }, template);
    }

    return function() {

        this.id = 'FrontsLatestReviewsCard';
        this.start = '2014-02-28';
        this.expiry = '2014-03-08';
        this.author = 'Darren Hurley';
        this.description = 'Add a latest reviews card to the features container';
        this.audience = 0.1;
        this.audienceOffset = 0.0;
        this.successMeasure = 'Click-through for the page as a whole.';
        this.audienceCriteria = 'Users who are not on desktop or bigger, on the network front.';
        this.dataLinkNames = 'card | latest reviews | trail | {{index}}';
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
                id: 'latest-reviews',
                test: function (context, config) {
                    reqwest({
                        url: 'http://content.guardianapis.com/search?tag=tone%2Freviews%2Cculture%2Fculture&page-size=3&show-fields=starRating',
                        type: 'jsonp'
                    })
                        .then(function(resp) {
                            var reviews = [];
                            resp.response.results.forEach(function(result, index) {
                                var starRating = result.fields.starRating;
                                reviews.push(
                                    fillTemplate(
                                        '<li class="container__card__item" data-link-name="trail | {{index}}"><a href="{{url}}" data-link-name="article">{{section}}: {{title}}</a>' +
                                            ((starRating !== undefined) ?
                                                '<span class="stars s-{{rating}}" itemprop="reviewRating" itemscope itemtype="http://schema.org/Rating">' +
                                                    '<meta itemprop="worstRating" content="1" />' +
                                                    '<span itemprop="ratingValue">{{rating}}</span> /' +
                                                    '<span itemprop="bestRating">5</span> stars' +
                                                '</span>' : '') +
                                        '</li>',
                                        {url: result.webUrl.replace(/https?:\/\/[^/]*/, ''), title: result.webTitle, section: result.sectionName, rating: result.fields.starRating, index: index + 1}
                                    )
                                );
                            });
                            var $card = bonzo(
                                    bonzo.create(
                                        fillTemplate(
                                            '<div class="container__card" data-link-name="card | latest reviews"><h3 class="container__card__title">Latest reviews</h3><ul class="unstyled">{{reviews}}</ul></div>',
                                            {reviews:  reviews.join('')}
                                        )
                                    )
                                ).appendTo(qwery('.container--features')[0]),
                                yPosition = 513 - $card.dim().height;
                            $card.css('top', yPosition + 'px');
                        });
                }
            }
        ];
    };
});
