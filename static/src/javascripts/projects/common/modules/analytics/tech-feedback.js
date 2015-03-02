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
                var oldHref = link.attr('href');
                fastdom.write(function () {
                    link.attr('href', oldHref + '&width=' + window.innerWidth);
                });
            });
        }
    };
});
