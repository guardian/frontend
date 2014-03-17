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

        this.id = 'FrontsCartoonCard';
        this.start = '2014-03-17';
        this.expiry = '2014-03-24';
        this.author = 'Darren Hurley';
        this.description = 'Add a cartoon card to the Comment and Debate container';
        this.audience = 0.25;
        this.audienceOffset = 0;
        this.successMeasure = 'Click-through for the page as a whole.';
        this.audienceCriteria = 'Users who are not on desktop or bigger, on the network front.';
        this.dataLinkNames = 'card | cartoon';
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
                id: 'cartoon',
                test: function () {
                    ajax({
                        url        : '/tagged.json?tag=theguardian/series/guardiancommentcartoon',
                        type       : 'json',
                        crossOrigin: true
                    })
                        .then(function(resp) {
                            var $card = getProperty(resp, 'trails', [])
                                    .map(function(result) {
                                        return bonzo(bonzo.create(
                                            template(
                                                '<div class="container__card tone-comment tone-accent-border" data-link-name="card | cartoon">' +
                                                    '<h3 class="container__card__title tone-colour">Cartoon</h3>' +
                                                    '<a href="{{url}}" data-link-name="article" class="card__item card__item__link">' +
                                                        '<h4 class="card__item__title">{{headline}}</h4>' +
                                                        '<img src="{{thumbnail}}" alt="" width="140" height="84" class="card__item__image" />' +
                                                    '</a>' +
                                                '</div>',
                                                {
                                                    headline : result.webTitle,
                                                    url      : result.webUrl.replace(/https?:\/\/[^/]*/, ''),
                                                    thumbnail: result.thumbnail
                                                }
                                            )
                                        ));
                                    })
                                    .shift()
                                    .appendTo(qwery('.container--commentanddebate').shift()),
                                yPosition = 383 - $card.dim().height;
                            $card.css('top', yPosition + 'px');
                        });
                }
            }
        ];
    };
});
