define([
    'lib/$',
    'bean',
    'fastdom'
], function (
    $,
    bean,
    fastdom
) {
    var deleteButtonElm = $('#deleteButton')[0];
    var deleteFormElm = $('#deleteForm')[0];
    var deleteLoaderElm = $('#deleteLoader')[0];

    function disableDeleteButton() {
        fastdom.mutate(function () {
            deleteButtonElm && (deleteButtonElm.disabled = true);
        });
    }

    function showLoader() {
        fastdom.mutate(function () {
            deleteLoaderElm && deleteLoaderElm.classList.remove("is-hidden");
        });
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
