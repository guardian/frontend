define([
    'lib/$',
    'bean'
], function (
    $,
    bean
) {
    function setupLoadingAnimation() {
        if ($('#deleteForm').length && $('#deleteLoader').length) {
            bean.on($('#deleteForm')[0], 'submit', function() {
                $('#deleteLoader')[0].classList.remove("is-hidden");
            });
        }
    }

    return {
        init: function () {
            setupLoadingAnimation();
        }
    };
});
