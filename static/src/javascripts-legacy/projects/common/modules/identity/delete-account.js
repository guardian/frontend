define([
    'lib/$',
    'bean'
], function (
    $,
    bean
) {
    function disableDeleteButton() {
        $('#deleteButton')[0] && ($('#deleteButton')[0].disabled = true);
    }

    function showLoader() {
        $('#deleteLoader')[0] && $('#deleteLoader')[0].classList.remove("is-hidden");
    }

    function setupLoadingAnimation() {
        if ($('#deleteForm')[0] && $('#deleteLoader')[0]) {
            bean.on($('#deleteForm')[0], 'submit', function() {
                disableDeleteButton();
                showLoader();
            });
        }
    }

    return {
        init: function () {
            setupLoadingAnimation();
        }
    };
});
