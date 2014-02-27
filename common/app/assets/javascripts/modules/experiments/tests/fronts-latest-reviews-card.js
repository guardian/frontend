define([
    'reqwest',
    'bonzo',
    'qwery'
], function(
    reqwest,
    bonzo,
    qwery
) {

    function fillTemplate(template, params) {
        return Object.keys(params).reduce(function(template, token) {
            return template.replace('{{' + token + '}}', params[token]);
        }, template);
    }

    return function() {

        this.id = 'FrontsLatestReviewsCard';
        this.expiry = '2014-03-08';
        this.audience = 0.1;
        this.audienceOffset = 0.0;
        this.description = 'Add a latest reviews card to the features container';
        this.canRun = function(config) {
            return config.page.isFront && config.page.pageId === '';
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
                            resp.response.results.forEach(function(result) {
                                var starRating = result.fields.starRating;
                                reviews.push(
                                    fillTemplate(
                                        '<li class="container__card__item"><a href="{{url}}">{{section}}: {{title}}</a>' +
                                            ((starRating !== undefined) ?
                                                '<span class="stars s-{{rating}}" itemprop="reviewRating" itemscope itemtype="http://schema.org/Rating">' +
                                                    '<meta itemprop="worstRating" content="1" />' +
                                                    '<span itemprop="ratingValue">{{rating}}</span> /' +
                                                    '<span itemprop="bestRating">5</span> stars' +
                                                '</span>' : '') +
                                        '</li>',
                                        {url: result.webUrl.replace(/http:\/\/[^/]*/, ''), title: result.webTitle, section: result.sectionName, rating: result.fields.starRating}
                                    )
                                );
                            });
                            var $card = bonzo(
                                    bonzo.create(
                                        fillTemplate(
                                            '<div class="container__card"><h3 class="container__card__title">Latest reviews</h3><ul class="unstyled">{{reviews}}</ul></div>',
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
