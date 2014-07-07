define([
    'common/modules/commercial/badges',
    'common/utils/$',
    'qwery',
    'helpers/fixtures'
], function(
    badges,
    $,
    qwery,
    fixtures
) {

    describe('Badges', function() {

        var fixtureConf = {
                id: 'badges',
                fixtures: [
                    '<div class="facia-container">\
                        <div class="container">\
                            <div class="container__header"></div>\
                        </div>\
                        <div class="container">\
                            <div class="container__header"></div>\
                        </div>\
                    </div>'
                ]
            },
            adPreBadgeHtml = function(sponsor) {
                return '<div class="ad-slot--paid-for-badge__inner">' +
                    '<h3 class="ad-slot--paid-for-badge__header">Advertisement feature</h3>' +
                    '<p class="ad-slot--paid-for-badge__label">in association with</p>' +
                    '<p class="ad-slot--paid-for-badge__header">' + sponsor + '</p>' +
                '</div>';
            },
            spPreBadgeHtml = function(sponsor) {
                return '<div class="ad-slot--paid-for-badge__inner">' +
                    '<h3 class="ad-slot--paid-for-badge__header">Sponsored by:</h3>' +
                    '<p class="ad-slot--paid-for-badge__header">' + sponsor + '</p>' +
                '</div>';
            };

        beforeEach(function() {
            fixtures.render(fixtureConf);
        });

        afterEach(function() {
            fixtures.clean(fixtureConf.id);
            badges.reset();
        });

        describe('sponsored pages', function() {

            [
                {
                    type: 'sponsored',
                    name: 'spbadge'
                },
                {
                    type: 'advertisement-feature',
                    name: 'adbadge'
                }
            ].forEach(function(config) {

                    it('should add "' + config.name + '" badge to first container if page is ' + config.type, function() {
                        $('.facia-container').addClass('facia-container--' + config.type);
                        badges.init();
                        var $adSlot = $('.facia-container .container:first-child .ad-slot').first();
                        expect($adSlot.data('name')).toBe(config.name);
                        expect($adSlot.hasClass('ad-slot--paid-for-badge--front')).toBeTruthy();
                    });

                    it('should add pre-badge if sponsor\'s name available', function() {
                        var sponsor = 'Unilever',
                            container = $('.facia-container').first()
                                .addClass('facia-container--' + config.type)
                                .attr('data-sponsor', sponsor)[0];
                        badges.init();
                        expect($('.ad-slot', container).html()).toBe(
                                config.type === 'sponsored' ? spPreBadgeHtml(sponsor) : adPreBadgeHtml(sponsor)
                        );
                    });

                });

        });

        describe('sponsored containers', function() {

            var configs = [
                {
                    type: 'sponsored',
                    name: 'spbadge'
                },
                {
                    type: 'advertisement-feature',
                    name: 'adbadge'
                }
            ];

            configs.forEach(function(config) {
                it('should add "' + config.name + '" badge to ' + config.type + ' container', function() {
                    $('.container').first().addClass('container--' + config.type);
                    badges.init();
                    var $adSlot = $('.facia-container .container:first-child .ad-slot').first();
                    expect($adSlot.data('name')).toBe(config.name);
                    expect($adSlot.hasClass('ad-slot--paid-for-badge--front')).toBeTruthy();
                });
            });

            configs.forEach(function(config) {
                it('should not add more than one of the same badge', function () {
                    $('.container').addClass('container--' + config.type);
                    badges.init();
                    expect(qwery('.facia-container .ad-slot').length).toBe(1);
                });
            });

            configs.forEach(function(config) {
                it('should add pre-badge if sponsor\'s name available', function() {
                    var sponsor = 'Unilever',
                        container = $('.facia-container .container').first()
                            .addClass('container--' + config.type)
                            .attr('data-sponsor', sponsor)[0];
                    badges.init();
                    expect($('.ad-slot', container).html()).toBe(
                        config.type === 'sponsored' ? spPreBadgeHtml(sponsor) : adPreBadgeHtml(sponsor)
                    );
                });
            });

            it('should not add a badge if one already exists', function() {
                $('.facia-container .container__header').first().after('<div class="ad-slot--paid-for-badge"></div>');
                badges.init();
                expect(qwery('.facia-container .ad-slot').length).toBe(0);
            });

            it('should add container\'s keywords to ad', function() {
                $('.facia-container .container').first()
                    .addClass('container--sponsored')
                    .attr('data-keywords', 'russia,ukraine');
                badges.init();
                expect($('.facia-container .ad-slot').data('keywords')).toBe('russia,ukraine');
            });

            it('should add container\'s keywords to ad', function() {
                $('.facia-container .container').first()
                    .addClass('container--sponsored')
                    .attr('data-keywords', 'russia,ukraine');
                badges.init();
                expect($('.facia-container .ad-slot').data('keywords')).toBe('russia,ukraine');
            });

        });

    });
});
