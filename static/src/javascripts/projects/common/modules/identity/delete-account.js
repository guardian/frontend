import $ from 'lib/$';
import bean from 'bean';
import fastdom from 'fastdom';
var deleteButtonElm = $('#deleteButton')[0];
var deleteFormElm = $('#deleteForm')[0];
var deleteLoaderElm = $('#deleteLoader')[0];

function disableDeleteButton() {
    fastdom.write(function() {
        deleteButtonElm && (deleteButtonElm.disabled = true);
    });
}

function showLoader() {
    fastdom.write(function() {
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

export default {
    init: function() {
        setupLoadingAnimation();
    }
};
