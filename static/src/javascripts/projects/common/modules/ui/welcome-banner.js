define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/storage',
    'common/utils/template',
    'common/utils/load-css-promise',
    'common/views/svgs'
], function (
    bean,
    fastdom,
    $,
    storage,
    template,
    loadCssPromise,
    svgs
) {
    /**
     * Rules:
     * 1st visit replace nav bar with banner
     */
    var header = document.getElementById('header'),
        message1 = '<div class="banner-message"><%=HTML%></div>',
        data = {
            'award-winning': {
                HTML: '<span class="line-1">award-winning news,</span><span class="line-2">sport and culture</span>'
            }
        };

    function showWelcomeMessage(messageName) {
        loadCssPromise.then(function () {
            createAndSetHeader(messageName);
        });
    }

    function createAndSetHeader(messageName) {
        var headerDiv = document.createElement('button'),
            msg = template(message1, data[messageName]);

        var closeBtn = '<div class="banner-close-icon"><button class="js-welcome-message__item__close button button--tertiary u-faux-block-link__promote" aria-label="Dismiss" data-link-name="close button">' + svgs('closeCentralIcon') + '</button></div>';

        headerDiv.setAttribute('id', 'welcome-banner');
        headerDiv.setAttribute('data-link-name', 'welcome-banner');
        headerDiv.setAttribute('style', 'height:' + header.offsetHeight + 'px;');
        headerDiv.innerHTML = closeBtn + msg;
        headerDiv.className += 'u-faux-block-link__promote';

        bean.on($(headerDiv)[0], 'click', function () {
            fastdom.write(function () {
                headerDiv.style.opacity = 0;
            });
        });

        header.getElementsByClassName('l-header-main')[0].style.zIndex = 1200;
        header.appendChild(headerDiv);

        setTimeout(function(){
            headerDiv.style.opacity = 1;
        }, 0);
    }

    return {
        showWelcomeMessage: showWelcomeMessage
    };
});
