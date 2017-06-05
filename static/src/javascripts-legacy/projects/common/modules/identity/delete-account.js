define([
    'lib/$',
    'bean'
], function (
    $,
    bean
) {
    var deleteButtonElm = $('#deleteButton')[0];
    var deleteFormElm = $('#deleteForm')[0];
    var deleteLoaderElm = $('#deleteLoader')[0];

    function disableDeleteButton() {
        deleteButtonElm && (deleteButtonElm.disabled = true);
    }

    function showLoader() {
        deleteLoaderElm && deleteLoaderElm.classList.remove("is-hidden");
    }

    function setupLoadingAnimation() {
        if (deleteFormElm && deleteLoaderElm) {
            bean.on(deleteFormElm, 'submit', function() {
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
