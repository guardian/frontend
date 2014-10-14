define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'jasq'
], function (
    qwery,
    $,
    fixtures
) {

    describe('Badges', {
        moduleName: 'common/modules/commercial/badges',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        switches: {
                            sponsored: true
                        },
                        page: {
                            section: 'news'
                        }
                    };
                }
            }
        },
        specify: function () {

            var fixturesConfig = {
                    id: 'badges',
                    fixtures: [
                        '<div class="facia-container">\
                            <div class="container">\
                                <div class="js-container__header"></div>\
                            </div>\
                            <div class="container">\
                                <div class="js-container__header"></div>\
                            </div>\
                        </div>'
                    ]
                },
                adPreBadgeHtml = function(sponsor) {
                    return '<div class="ad-slot--paid-for-badge__inner ad-slot__content--placeholder">\n' +
                        '   <h3 class="ad-slot--paid-for-badge__header">Brought to you by:</h3>\n' +
                        '   <p class="ad-slot--paid-for-badge__header">' + sponsor + '</p>\n' +
                        '</div>';
                },
                spPreBadgeHtml = function(sponsor) {
                    return '<div class="ad-slot--paid-for-badge__inner ad-slot__content--placeholder">\n' +
                        '   <h3 class="ad-slot--paid-for-badge__header">Sponsored by:</h3>\n' +
                        '   <p class="ad-slot--paid-for-badge__header">' + sponsor + '</p>\n' +
                        '</div>';
                },
                $fixtureContainer;

            beforeEach(function () {
                $fixtureContainer = fixtures.render(fixturesConfig);
            });

            afterEach(function () {
                fixtures.clean(fixturesConfig.id);
            });

            it('should exist', function (badges) {
                expect(badges).toBeDefined();
            });

            it('should not display ad slot if sponsored switch is off', function (badges, deps) {
                deps['common/utils/config'].switches.sponsored = false;
                expect(badges.init()).toBe(false);
                expect(qwery('.ad-slot', $fixtureContainer).length).toBe(0);
            });

            describe('sponsored pages', function() {

                [
                    {
                        type: 'sponsored',
                        name: 'spbadge1'
                    },
                    {
                        type: 'advertisement-feature',
                        name: 'adbadge1'
                    }
                ].forEach(function (badge) {

                        it(
                            'should add "' + badge.name + '" badge to first container if page is ' + badge.type,
                            function (badges) {
                                $('.facia-container', $fixtureContainer).addClass('facia-container--' + badge.type);
                                badges.init();
                                var $adSlot = $('.facia-container .container:first-child .ad-slot', $fixtureContainer)
                                    .first();
                                expect($adSlot.data('name')).toBe(badge.name);
                                expect($adSlot.hasClass('ad-slot--paid-for-badge--front')).toBeTruthy();
                            }
                        );

                        it('should add pre-badge if sponsor\'s name available', function (badges) {
                            var sponsor = 'Unilever',
                                container = $('.facia-container', $fixtureContainer).first()
                                    .addClass('facia-container--' + badge.type)
                                    .attr('data-sponsor', sponsor)[0];
                            badges.init();
                            expect($('.ad-slot', container).html()).toBe(
                                    badge.type === 'sponsored' ? spPreBadgeHtml(sponsor) : adPreBadgeHtml(sponsor)
                            );
                        });

                    });

            });

            describe('sponsored containers', function () {

                var configs = [
                    {
                        type: 'sponsored',
                        name: 'spbadge1'
                    },
                    {
                        type: 'advertisement-feature',
                        name: 'adbadge1'
                    }
                ];

                configs.forEach(function (badge) {
                    it('should add "' + badge.name + '" badge to ' + badge.type + ' container', function (badges) {
                        $('.container', $fixtureContainer).first().addClass('container--' + badge.type);
                        badges.init();
                        var $adSlot = $('.facia-container .container:first-child .ad-slot', $fixtureContainer).first();
                        expect($adSlot.data('name')).toBe(badge.name);
                        expect($adSlot.hasClass('ad-slot--paid-for-badge--front')).toBeTruthy();
                    });
                });

                configs.forEach(function (badge) {
                    it('should not add more than one of the same badge', function (badges) {
                        $('.container', $fixtureContainer).addClass('container--' + badge.type);
                        badges.init();
                        expect(qwery('.facia-container .ad-slot[data-name="' + badge.name + '"]').length).toBe(1);
                    });
                });

                configs.forEach(function (badge) {
                    it('should add pre-badge if sponsor\'s name available', function (badges) {
                        var sponsor = 'Unilever',
                            container = $('.facia-container .container', $fixtureContainer).first()
                                .addClass('container--' + badge.type)
                                .attr('data-sponsor', sponsor)[0];
                        badges.init();
                        expect($('.ad-slot', container).html()).toBe(
                                badge.type === 'sponsored' ? spPreBadgeHtml(sponsor) : adPreBadgeHtml(sponsor)
                        );
                    });
                });

                it('should not add a badge if one already exists', function (badges) {
                    $('.facia-container .container__header', $fixtureContainer).first()
                        .after('<div class="ad-slot--paid-for-badge"></div>');
                    badges.init();
                    expect(qwery('.facia-container .ad-slot', $fixtureContainer).length).toBe(0);
                });

                it('should add container\'s keywords to ad', function (badges) {
                    $('.facia-container .container', $fixtureContainer).first()
                        .addClass('container--sponsored')
                        .attr('data-keywords', 'russia,ukraine');
                    badges.init();
                    expect($('.facia-container .ad-slot', $fixtureContainer).data('keywords')).toBe('russia,ukraine');
                });

                it('should add container\'s keywords to ad', function (badges) {
                    $('.facia-container .container', $fixtureContainer).first()
                        .addClass('container--sponsored')
                        .attr('data-keywords', 'russia,ukraine');
                    badges.init();
                    expect($('.facia-container .ad-slot', $fixtureContainer).data('keywords')).toBe('russia,ukraine');
                });

                it('should increment badge id if multiple badges added', function (badges) {
                    var $containers = $('.container', $fixtureContainer).addClass('container--sponsored');
                    badges.init();
                    expect(qwery('#dfp-ad--spbadge1', $containers[0]).length).toBe(1);
                    expect(qwery('#dfp-ad--spbadge2', $containers[1]).length).toBe(1);
                });

                it('should be able to add badge to a container', function (badges) {
                    var $container = $('.container', $fixtureContainer).first().addClass('container--sponsored');
                    badges.add($container);
                    expect(qwery('#dfp-ad--spbadge1', $container[0]).length).toBe(1);
                });

            });

        }
    });

});
