// This is a workaround for the email preferences page https://profile.thegulocal.com/email-prefs
// We want to submit subscribe/unsubscribe requests without a full page refresh


define([
    'bean',
    'common/utils/$'
], function (
    bean,
    $
) {
    function doTheThing(buttonEl) {
        console.log('found a button');
        // use bean for click event
        buttonEl.addEventListener('click', sendFormData);
    }

    function addButtonClickEvents() {
        $.forEachElement('.email-subscription__button', doTheThing);
    }

    function parseFormData() {

    }

    function sendFormData() {
        console.log('sending the form');
        // check the sub status of this button
        // get the CSRFtoken and other form data
        // parse the form data (uriencode to escape chars, ampersand to link)

    }

    return {
        init: function () {
            console.log('RUNNING! WOOP');
            addButtonClickEvents();
        }
    };
});
