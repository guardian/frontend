define([
    'bonzo',
    'bean',
    'common/$',
    'common/utils/mediator',
    'common/utils/detect'
], function (
    bonzo,
    bean,
    $,
    mediator,
    detect) {

var FootballTablePosition = function () {

    this.id = 'FootballTablePosition';
    this.expiry = '2014-03-12';
    this.audience = 0.2;
    this.audienceOffset = 0.5;
    this.description = 'Varies the football tables\'s position and functionality';
    this.canRun = function(config) {
        return config.page &&
               config.page.contentType === 'Article' &&
               config.page.section === 'football' &&
               $('.js-football-competition').length > 0 &&
               !(detect.getBreakpoint() === 'desktop' || detect.getBreakpoint() === 'wide');
    };

    this.variants = [
        {
            id: 'control',
            test: function (context) {
                return true;
            }
        },
        {
            id: 'below-image',
            test: function (context) {
                mediator.on('bootstrap:football:rhs:table:ready', function() {
                    tableBelowImage(context);
                });
            }
        },
        {
            id: 'below-article',
            test: function (context) {
                mediator.on('bootstrap:football:rhs:table:ready', function() {
                    tableBelowArticle(context);
                });
            }
        },
        {
            id: 'below-image-dark',
            test: function (context) {
                mediator.on('bootstrap:football:rhs:table:ready', function() {
                    tableBelowImage(context, true);
                });
            }
        },
        {
            id: 'below-article-dark',
            test: function (context) {
                mediator.on('bootstrap:football:rhs:table:ready', function() {
                    tableBelowArticle(context, true);
                });
            }
        }
    ];

    function tableBelowImage(context, dark) {
        var $table = $('.js-football-table', context);
        $('.media-primary', context).after($table);
        scrunchTable($table, dark);
    }

    function tableBelowArticle(context, dark) {
        var $table = $('.js-football-table', context);
        $('.article-body', context).append($table);
        scrunchTable($table, dark);
    }

    function scrunchTable($table, dark) {
        var caption = $('caption', $table[0]),
            t = $('caption a', $table[0]).text()+ ' table',
            showTableElem = bonzo.create('<div class="toggler"><span class="toggler__text" aria-role="button" data-link-name="expand-football-table">'+ t +'</span><span class="i i-expander"></span></div>')[0],
            $showTableElem = bonzo(showTableElem);

        caption.remove();
        $table.addClass('u-h');
        $table.attr('aria-expanded', 'false');
        $table.before(showTableElem);

        if (dark) {
            $showTableElem.addClass('toggler--dark');
        }

        $showTableElem.append($table);

        bean.on(showTableElem, 'click', function(e) {
            if ($showTableElem.hasClass('toggler--active')) {
                $table.addClass('u-h');
                $showTableElem.removeClass('toggler--active');
                $table.attr('aria-expanded', 'false');
            } else {
                $table.removeClass('u-h');
                $showTableElem.addClass('toggler--active');
                $table.attr('aria-expanded', 'true');
            }
        });
    }
};

return FootballTablePosition;

}); // define
