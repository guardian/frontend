define([
    'common/$',
    'common/modules/adverts/dfp',
    'lodash/functions/once'
], function (
    $,
    dfp,
    once
) {

    return {

        init: once(function() {
            $('.container--sponsored, .container--advertisement-feature').each(function(container) {
                var isSponsored = $(container).hasClass('container--sponsored');
                $('.container__header', container)
                    .after(dfp.createAdSlot((isSponsored ? 'sp' : 'ad') + 'badge', 'paid-for-badge'));
            });
        })

    };

});
