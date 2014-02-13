define([
    'common/common',
    'bonzo',
    'common/utils/mediator',
    'common/utils/detect',
    'common/modules/userPrefs'
], function (
    common,
    bonzo,
    mediator,
    detect,
    userPrefs
) {

    function Sections(config) {

        var className = 'is-off',
            that = this,
            hasCrossedBreakpoint = detect.hasCrossedBreakpoint(),
            contexts = {},
            sections = [
                {
                    sectionId:   'culture',
                    sectionName: 'Culture',
                    sectionTone: 'feature',
                    zones: {
                        '/culture'     : 'Culture',
                        '/film'        : 'Film',
                        '/tv-and-radio': 'TV & radio',
                        '/music'       : 'Music',
                        '/books'       : 'Books',
                        '/artanddesign': 'Art & design',
                        '/stage'       : 'Stage'
                    }
                },{
                    sectionId:   'football',
                    sectionName: 'Football',
                    sectionTone: 'news',
                    zones: {
                        '/football'              : 'Football',
                        '/football/tables'       : 'Tables',
                        '/football/live'         : 'Live scores',
                        '/football/fixtures'     : 'Fixtures',
                        '/football/results'      : 'Results',
                        '/football/teams'        : 'Teams',
                        '/football/competitions' : 'Leagues & competitions'
                    }
                },{
                    sectionId:   'sport',
                    sectionName: 'Sport',
                    sectionTone: 'news',
                    zones: {
                        '/sport'             : 'Sport',
                        '/football'          : 'Football',
                        '/sport/cricket'     : 'Cricket',
                        '/sport/tennis'      : 'Tennis',
                        '/sport/rugby-union' : 'Rugby union',
                        '/sport/cycling'     : 'Cycling',
                        '/sport/us-sport'    : 'US sports'
                    }
                },{
                    sectionId:   'technology',
                    sectionName: 'Technology',
                    sectionTone: 'news',
                    zones: {
                        '/technology': 'Technology',
                        '/technology/games': 'Games'
                    }
                },{
                    sectionId:   'business',
                    sectionName: 'Business',
                    sectionTone: 'news',
                    zones: {
                        '/business': 'Business',
                        '/business/economics': 'Economics',
                        '/business/useconomy': 'US economy',
                        '/business/recession': 'Recession',
                        '/business/investing': 'Investing',
                        '/business/banking': 'Banking',
                        '/business/marketforceslive': 'Market forces live',
                        '/business/blog': 'Business blog'
                    }
                },{
                    sectionId:   'money',
                    sectionName: 'Money',
                    sectionTone: 'news',
                    zones: {
                        '/money': 'Money',
                        '/money/property': 'Property',
                        '/money/houseprices': 'House prices',
                        '/money/pensions': 'Pensions',
                        '/money/savings': 'Savings',
                        '/money/debt': 'Borrowing &amp; debt',
                        '/money/insurance': 'Insurance',
                        '/money/work-and-careers': 'Work &amp; careers',
                        '/money/consumer-affairs': 'Consumer affairs'
                    }
                },{
                    sectionId:   'lifeandstyle',
                    sectionName: 'Life &amp; Style',
                    sectionTone: 'news',
                    zones: {
                        '/lifeandstyle': 'Life &amp; Style',
                        '/fashion': 'Fashion',
                        '/lifeandstyle/health-and-wellbeing': 'Health',
                        '/lifeandstyle/food-and-drink': 'Food',
                        '/lifeandstyle/relationships': 'Relationships',
                        '/lifeandstyle/family': 'Family',
                        '/lifeandstyle/women': 'Women',
                        '/lifeandstyle/homes+gardens': 'Home &amp; Garden'
                    }
                },{
                    sectionId:   'travel',
                    sectionName: 'Travel',
                    sectionTone: 'news',
                    zones: {
                        '/travel': 'Travel',
                        '/travel/short-breaks': 'Short breaks',
                        '/travel/hotels': 'Hotels',
                        '/travel/restaurants': 'Restaurants',
                        '/travel/budget': 'Budget travel'
                    }
                }
            ];

        this.view = {
            bindings : function(context) {
                var id = context.id;

                if (contexts[id]){
                    return;
                }
                contexts[id] = true;

                var sectionsHeader = context.querySelector('.nav-popup--sections'),
                    sectionsNav    = context.querySelector('.nav--global');

                if (!sectionsHeader || !sectionsNav) {
                    return;
                }

                mediator.addListener('window:resize', function(e) {
                    hasCrossedBreakpoint(function(layoutMode) {

                        bonzo(sectionsHeader).addClass(className);

                        if(layoutMode !== 'mobile') {
                            that.view.hideColumns(sectionsHeader, sectionsNav);

                            // Hide popup localnav if visible
                            common.$g('.nav-popup--localnav').addClass('is-off');
                        } else {
                            that.view.showColumns(sectionsHeader, sectionsNav);
                        }
                    });
                });

                if (detect.getBreakpoint() !== 'mobile') {
                    that.view.hideColumns(sectionsHeader, sectionsNav);
                }
            },

            showColumns : function(sectionsHeader, sectionsNav) {
                common.$g('.nav__item', sectionsHeader).removeClass('u-h');
            },

            hideColumns :  function(sectionsHeader, sectionsNav) {
                var firstTopPos,
                    visibleItems = [],
                    popupItems = common.$g('.nav__item', sectionsHeader).removeClass('u-h');

                common.$g('.nav__item', sectionsNav).each(function(e) {
                    firstTopPos = firstTopPos || bonzo(e).offset().top;
                    if (bonzo(e).offset().top === firstTopPos) {
                        visibleItems.push(e);
                    }
                });

                for (var i=0, l=visibleItems.length; i < l; i++) {
                    bonzo(popupItems[i]).addClass('u-h');
                }
            },

            getCurrentSection: function() {
                var pageSection = config.page.pageId.split('/')[0];
                for (var i=0; i < sections.length; i++) {
                    var zones = Object.keys(sections[i].zones);

                    if (zones.indexOf('/' + pageSection) !== -1) {
                        return sections[i];
                    }
                }

                return false;
            },

            insertLocalNav: function(context) {
                // This is a temporary measure for local navigation,
                // pending a backend solution to section hierarchies
                var currentSection = this.getCurrentSection();

                if (currentSection) {
                    var localNavItems = [],
                        headerNode = document.getElementById('header');

                    Object.keys(currentSection.zones).forEach(function(zonePath, i) {
                        var zoneName  = currentSection.zones[zonePath];
                        localNavItems.push('<li class="nav__item">' +
                                           '  <a href="'+zonePath+'" class="nav__link" data-link-name="'+zoneName+'">'+zoneName+'</a>' +
                                           '</li>');

                    });

                    // Insert the popup local nav
                    var localNavPopupHtml = '<div class="nav-popup--localnav nav-popup nav-popup--small is-off">' +
                                            '  <ul class="nav nav--columns nav--top-border-off u-cf" data-link-name="Sub Sections">' +
                                                 localNavItems.join('') +
                                            '  </ul>' +
                                            '</div>';


                    // Insert the CTA for the popup local nav
                    var sectionHeadNode = common.$g('.section-head', context),
                        sectionLink     = common.$g('.article-zone [data-link-name="article section"]', context).parent().html(),
                        localNavTitle   = sectionLink ||
                                          sectionHeadNode.text() ||
                                          currentSection.zones['/'+config.page.section] ||
                                          currentSection.sectionName,

                        localNavCtaHtml = '<div class="localnav--small tone-' + currentSection.sectionTone + ' tone-accent-border">' +
                                          '  <div class="localnav__inner u-cf">' +
                                          '    <h1 class="localnav__title tone-colour">'+localNavTitle+'</h1>' +
                                          '      <button class="localnav__cta tone-background tone-border control" ' +
                                          '          data-link-name="Popup Localnav" ' +
                                          '          data-toggle="nav-popup--localnav">' +
                                          '        <i class="i i-local-nav-arrow"></i>' +
                                          '      </button></div>' +
                                          '  </div>' +
                                          '</div>';

                    bonzo(headerNode).append(localNavPopupHtml);
                    bonzo(context.querySelector('.parts__head')).append(localNavCtaHtml);


                    // Insert the desktop local nav
                    var localNavHtml = '<ul class="nav nav--local u-cf" data-link-name="Local Navigation">' +
                                         localNavItems.splice(1).join('') + // Skip the first link to the top section for desktop
                                       '</ul>';
                    common.$g('.js-localnav-placeholder', headerNode).html('<div class="localnav-container"><div class="gs-container">' + localNavHtml + '</div></div>');

                    common.$g('#preloads').addClass('has-localnav');

                    // Highlight the section that we're in
                    // Try to match the against pageId first (covers sport pseudo-sections, eg Cricket, Rugby...)
                    var activeNodes = common.$g('.nav__link[href="/'+config.page.pageId+'"]', headerNode)
                                            .parent().addClass('is-active');

                    // ...otherwise fallback to matching real sections (eg Books, Arts)
                    if (activeNodes.length === 0) {
                        common.$g('.nav__link[href="/'+config.page.section+'"]', headerNode)
                              .parent().addClass('is-active');
                    }


                    // Hack to remove the double highlighting in the nav of Sport+Football
                    if (currentSection.sectionId === 'football') {
                        var sportNode = common.$g('.is-active .nav__link[data-link-name="Sport"]', headerNode);
                        sportNode.parent().removeClass('is-active');
                    }

                }

            }
        };

        this.init = function (context) {
            this.view.bindings(context);
            if (config.switches.localNav) {
                this.view.insertLocalNav(context);
            }
        };
     }

    return Sections;

});
