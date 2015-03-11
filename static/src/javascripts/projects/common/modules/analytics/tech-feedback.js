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
            var form = $('.js-tech-feedback');
            if (form.length) {
                bean.on(form[0], 'submit', function () {
                    var oldHref = form.attr('action');
                    form.attr('action', oldHref + '&width=' + window.innerWidth);
                });
            }

        }
    };
});
