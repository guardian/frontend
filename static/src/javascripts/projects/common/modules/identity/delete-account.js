import $ from 'lib/$';
import bean from 'bean';
import fastdom from 'fastdom';
const deleteButtonElm = $('#deleteButton')[0];
const deleteFormElm = $('#deleteForm')[0];
const deleteLoaderElm = $('#deleteLoader')[0];

function disableDeleteButton() {
    fastdom.write(() => {
        deleteButtonElm && (deleteButtonElm.disabled = true);
    });
}

function showLoader() {
    fastdom.write(() => {
        deleteLoaderElm && deleteLoaderElm.classList.remove("is-hidden");
    });
}

function setupLoadingAnimation() {
    if (deleteFormElm && deleteLoaderElm) {
        bean.on(deleteFormElm, 'submit', () => {
            disableDeleteButton();
            showLoader();
        });
    }
}

export default {
    init() {
        setupLoadingAnimation();
    }
};
