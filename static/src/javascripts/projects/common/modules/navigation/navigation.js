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

    Navigation.prototype.toggleMegaNav = function () {
        var $headerNav = $('.js-navigation-header'),
            that = this;

        fastdom.write(function () {
            if (!that.isInserted) {
                $('.js-mega-nav-placeholder').html(that.megaNavHtml);
                that.isInserted = true;
                mediator.emit('modules:nav:inserted');
            }

            $headerNav.toggleClass('navigation--expanded navigation--collapsed');
            mediator.emit(target.hasClass('navigation--expanded') ? 'modules:nav:open' : 'modules:nav:close');
        });
    };

    Navigation.prototype.enableMegaNavToggle = function () {
        var that = this;

        bean.on(document, 'click', '.js-navigation-toggle', function (e) {
            e.preventDefault();
            that.toggleMegaNav();

            if ($(e.currentTarget).attr('data-target-nav') === 'js-navigation-footer') {
                that.scrollToHeaderNav();
            }
        });
    };

    return Navigation;
});
