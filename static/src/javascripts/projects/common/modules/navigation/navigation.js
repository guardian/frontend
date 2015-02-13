define([
    'bean',
    'qwery',
    'fastdom',
    'common/utils/mediator',
    'common/utils/$'
], function (
    bean,
    qwery,
    fastdom,
    mediator,
    $
) {
    function Navigation() {
        this.isInserted = false;
    }

    Navigation.prototype.init = function () {
        this.eatMegaNav();
        this.enableMegaNavToggle();
        this.replaceAllSectionsLink();
        this.$headerNav = $('.js-navigation-header');
    };

    Navigation.prototype.eatMegaNav = function () {
        var $megaNav = $('.js-transfuse');

        this.megaNavHtml = $megaNav.html();

        fastdom.write(function () {
            $megaNav.remove();
        });
    };

    Navigation.prototype.replaceAllSectionsLink = function () {
        $('.js-navigation-toggle').attr('href', '#nav-allsections');
    };

    Navigation.prototype.scrollToHeaderNav = function () {
        var that = this;

        fastdom.read(function () {
            window.scrollTo(0, that.$headerNav.offset().top);
        });
    };

    Navigation.prototype.setMegaNavState = function (open) {
        var that = this;

        fastdom.write(function () {
            if (open && !that.isInserted) {
                $('.js-mega-nav-placeholder').html(that.megaNavHtml);
                that.isInserted = true;
                mediator.emit('modules:nav:inserted');
            }

            that.$headerNav.toggleClass('navigation--expanded', open);
            that.$headerNav.toggleClass('navigation--collapsed', !open);

            mediator.emit(open ? 'modules:nav:open' : 'modules:nav:close');
        });
    };

    Navigation.prototype.isExpanded = function () {
        return this.$headerNav.hasClass('navigation--expanded');
    };

    Navigation.prototype.enableMegaNavToggle = function () {
        var that = this;

        bean.on(document, 'click', '.js-navigation-toggle', function (e) {
            var isFooter = $(e.currentTarget).attr('data-target-nav') === 'js-navigation-footer';

            e.preventDefault();

            if (isFooter) {
                that.scrollToHeaderNav();
            }

            that.setMegaNavState(isFooter || !that.isExpanded());
        });
    };

    return Navigation;
});
