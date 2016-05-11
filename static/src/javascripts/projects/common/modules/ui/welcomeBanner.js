define([
    'fastdom',
    'common/utils/$',
    'common/utils/storage',
    'common/utils/template',
    'common/utils/load-css-promise'
], function (
    fastdom,
    $,
    storage,
    template,
    loadCssPromise
) {
    /**
     * Rules:
     * 1st visit replace nav bar with banner
     */
    var header = document.getElementById('header'),
        message1 = '<div class="banner-message"><%=HTML%></div>',
        DATA = {
            MESSAGE1: {
                HTML: '<span class="pull-left">news website</span><span class="pull-right">of the year</span>'
            }
        };

    function showWelcomeMessage(messageNumber) {
        loadCssPromise.then(function () {
            createAndSetHeader(messageNumber);
        });
    }

    function createAndSetHeader(messageNumber) {
        var headerDiv = document.createElement('DIV'),
            msg = template(message1, DATA[messageNumber.toUpperCase()]);

        headerDiv.setAttribute('id', 'welcomeBanner');
        headerDiv.setAttribute('style', 'height:' + header.offsetHeight + 'px;');
        headerDiv.innerHTML = msg;

        header.getElementsByClassName('l-header-main')[0].setAttribute('style', 'z-index:1200;');

        header.appendChild(headerDiv);
    }

    return {
        showWelcomeMessage: showWelcomeMessage
    };
});
