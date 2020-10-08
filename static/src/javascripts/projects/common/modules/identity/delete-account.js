// @flow
import $ from 'lib/$';
import bean from 'bean';
import fastdom from 'fastdom';

const deleteButtonElm = $('#deleteButton')[0];
const deleteFormElm = $('#deleteForm')[0];
const deleteLoaderElm = $('#deleteLoader')[0];

const disableDeleteButton = (): void => {
    if (deleteButtonElm) {
        fastdom.mutate(() => {
            deleteButtonElm.disabled = true;
        });
    }
};

const showLoader = (): void => {
    if (deleteLoaderElm) {
        fastdom.mutate(() => {
            deleteLoaderElm.classList.remove('is-hidden');
        });
    }
};

const setupLoadingAnimation = (): void => {
    if (deleteFormElm && deleteLoaderElm) {
        bean.on(deleteFormElm, 'submit', () => {
            disableDeleteButton();
            showLoader();
        });
    }
};

export { setupLoadingAnimation };
