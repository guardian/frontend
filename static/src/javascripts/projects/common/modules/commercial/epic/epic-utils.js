import fastdom from 'lib/fastdom-promise';
import reportError from 'lib/report-error';
import mediator from 'lib/mediator';



const reportEpicError = (error) => {
    reportError(error, { feature: 'epic' }, false);
};

const insertAtSubmeta = (epic) =>
    fastdom
        .measure(() => document.querySelector('.submeta'))
        .then(element => {
            if (element && element.parentElement) {
                element.parentElement.insertBefore(epic.html, element);
                return Promise.resolve(epic);
            }
            const error = new Error('unable to insert Epic');
            reportEpicError(error);
            return Promise.reject(error);
        });

const awaitEpicButtonClicked = () =>
    new Promise(resolve => {
        mediator.on('module:clickstream:click', (clickSpec) => {
            if (clickSpec === true || clickSpec === false) {
                return;
            }
            const isEpicClick = clickSpec.tags.find(tag => tag === 'epic');
            if (isEpicClick) {
                resolve();
            }
        });
    });


export {
    reportEpicError,
    insertAtSubmeta,
    awaitEpicButtonClicked,
};
