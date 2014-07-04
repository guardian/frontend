define([
    'qwery',
    'bean',
    'bonzo'
], function (
    qwery,
    bean,
    bonzo
) {
    var NewNavigation = {
        init: function(){
            this.addMegaNavMenu();
            this.enableMegaNavToggle();
        },

        addMegaNavMenu: function(){
            var megaNav = bonzo(qwery('.js-transfuse'));
            var placeholder = bonzo(qwery('.'+megaNav.attr('data-transfuse-target')));
            placeholder.html(megaNav.html());
        },

        enableMegaNavToggle: function(){
            qwery('.js-new-navigation-toggle').forEach(function(elem) {
                bean.on(elem, 'click touchstart', function (e) {
                    e.preventDefault();
                    if (qwery('.new-navigation--expanded').length > 0) {
                        bonzo(qwery('.new-navigation'))
                            .removeClass('new-navigation--expanded')
                            .addClass('new-navigation--collapsed');
                    } else {
                        bonzo(qwery('.new-navigation'))
                            .addClass('new-navigation--expanded')
                            .removeClass('new-navigation--collapsed');
                    }
                });
            });
        }
    };

    return NewNavigation;
});
