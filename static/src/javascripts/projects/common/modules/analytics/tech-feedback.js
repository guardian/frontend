define([
    'bean',
    'fastdom',
    'common/utils/$'
], function (
    bean,
    fastdom,
    $
) {

    return {
        init: function () {
            $('.js-tech-feedback').on('submit', function () {
                var oldHref = this.attr('action');
                this.attr('action', oldHref + '&width=' + window.innerWidth);
            });
        }
    };
});
