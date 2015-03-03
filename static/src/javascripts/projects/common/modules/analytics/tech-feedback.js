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
            var link = $('.js-tech-feedback');
            fastdom.read(function () {
                var oldHref = link.attr('action');
                fastdom.write(function () {
                    link.attr('action', oldHref + '&width=' + window.innerWidth);
                });
            });
        }
    };
});
