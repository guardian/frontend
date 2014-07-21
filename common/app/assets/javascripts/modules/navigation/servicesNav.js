define([
    'qwery',
    'bean',
    'common/utils/$'
], function (
    qwery,
    bean,
    $
) {
    var GuardianServicesNav = {
        init: function(){
            this.enableNavToggle();
        },

        enableNavToggle: function(){
            qwery('.js-services-nav-toggle').forEach(function(elem) {
                bean.on(elem, 'click touchstart', function (e) {
                    e.preventDefault();
                    if (qwery('.guardian-services__item-more--expanded').length > 0) {
                        $('.guardian-services__item-more--expanded')
                            .removeClass('guardian-services__item-more--expanded')
                            .addClass('guardian-services__item-more--collapsed');
                    } else {
                        $('.guardian-services__item-more--collapsed')
                            .removeClass('guardian-services__item-more--collapsed')
                            .addClass('guardian-services__item-more--expanded');
                    }
                });
            });
        }
    };

    return GuardianServicesNav;
});
