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

        var fixturesConfig = {
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
                return '<div class="ad-slot--paid-for-badge__inner ad-slot__content--placeholder">' +
                    '<h3 class="ad-slot--paid-for-badge__header">Advertisement feature</h3>' +
                    '<p class="ad-slot--paid-for-badge__label">in association with</p>' +
                    '<p class="ad-slot--paid-for-badge__header">' + sponsor + '</p>' +
                '</div>';
            },
            spPreBadgeHtml = function(sponsor) {
                return '<div class="ad-slot--paid-for-badge__inner ad-slot__content--placeholder">' +
                    '<h3 class="ad-slot--paid-for-badge__header">Sponsored by:</h3>' +
                    '<p class="ad-slot--paid-for-badge__header">' + sponsor + '</p>' +
                '</div>';
            },
            fixture,
            config;

        beforeEach(function() {
            fixtures.render(fixturesConfig);
            fixture = qwery('#' + fixturesConfig.id)[0];
            config = {
                switches: {
                    sponsored: true
                }
            };
        });

        afterEach(function() {
            fixtures.clean(fixturesConfig.id);
            badges.reset();
        });

        it('should exist', function() {
            expect(badges).toBeDefined();
        });

        it('should not display ad slot if sponsored switch is off', function() {
            config.switches.sponsored = false;
            expect(badges.init(config)).toBe(false);
            expect(qwery('.ad-slot', fixture).length).toBe(0);
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
            ].forEach(function(badge) {

                    it('should add "' + badge.name + '" badge to first container if page is ' + badge.type, function() {
                        $('.facia-container').addClass('facia-container--' + badge.type);
                        badges.init(config);
                        var $adSlot = $('.facia-container .container:first-child .ad-slot').first();
                        expect($adSlot.data('name')).toBe(badge.name);
                        expect($adSlot.hasClass('ad-slot--paid-for-badge--front')).toBeTruthy();
                    });

                    it('should add pre-badge if sponsor\'s name available', function() {
                        var sponsor = 'Unilever',
                            container = $('.facia-container').first()
                                .addClass('facia-container--' + badge.type)
                                .attr('data-sponsor', sponsor)[0];
                        badges.init(config);
                        expect($('.ad-slot', container).html()).toBe(
                                badge.type === 'sponsored' ? spPreBadgeHtml(sponsor) : adPreBadgeHtml(sponsor)
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

            configs.forEach(function(badge) {
                it('should add "' + badge.name + '" badge to ' + badge.type + ' container', function() {
                    $('.container').first().addClass('container--' + badge.type);
                    badges.init(config);
                    var $adSlot = $('.facia-container .container:first-child .ad-slot').first();
                    expect($adSlot.data('name')).toBe(badge.name);
                    expect($adSlot.hasClass('ad-slot--paid-for-badge--front')).toBeTruthy();
                });
            });

            configs.forEach(function(badge) {
                it('should not add more than one of the same badge', function () {
                    $('.container').addClass('container--' + badge.type);
                    badges.init(config);
                    expect(qwery('.facia-container .ad-slot[data-name="' + badge.name + '"]').length).toBe(1);
                });
            });

            configs.forEach(function(badge) {
                it('should add pre-badge if sponsor\'s name available', function() {
                    var sponsor = 'Unilever',
                        container = $('.facia-container .container').first()
                            .addClass('container--' + badge.type)
                            .attr('data-sponsor', sponsor)[0];
                    badges.init(config);
                    expect($('.ad-slot', container).html()).toBe(
                            badge.type === 'sponsored' ? spPreBadgeHtml(sponsor) : adPreBadgeHtml(sponsor)
                    );
                });
            });

            it('should not add a badge if one already exists', function() {
                $('.facia-container .container__header').first().after('<div class="ad-slot--paid-for-badge"></div>');
                badges.init(config);
                expect(qwery('.facia-container .ad-slot').length).toBe(0);
            });

            it('should add container\'s keywords to ad', function() {
                $('.facia-container .container').first()
                    .addClass('container--sponsored')
                    .attr('data-keywords', 'russia,ukraine');
                badges.init(config);
                expect($('.facia-container .ad-slot').data('keywords')).toBe('russia,ukraine');
            });

            it('should add container\'s keywords to ad', function() {
                $('.facia-container .container').first()
                    .addClass('container--sponsored')
                    .attr('data-keywords', 'russia,ukraine');
                badges.init(config);
                expect($('.facia-container .ad-slot').data('keywords')).toBe('russia,ukraine');
            });

        });

    });
});
