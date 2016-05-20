define([
    'fastdom',
    'common/utils/storage',
    'common/utils/template',
    'common/utils/load-css-promise',
    'common/views/svgs'
], function (
    fastdom,
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
        message1 = '<div class="banner-message"><span class="line-1"><%=first%></span><span class="line-2"><%=second%></span></div>',
        data = {
            'award-winning': {
                'first': 'award-winning news,',
                'second': 'sport and culture'
            }
        };

    function showWelcomeMessage(messageName) {
        loadCssPromise.then(function () {
            createAndSetHeader(messageName);
        });
    }

    function createAndSetHeader(messageName) {
        var newHeader = document.createElement('button'),
            msg = template(message1, data[messageName]),
            closeBtn = '<div class="banner-close-icon"><button class="js-welcome-message__item__close button button--tertiary u-faux-block-link__promote" aria-label="Dismiss" data-link-name="close button">' + svgs('closeCentralIcon') + '</button></div>';

        newHeader.id = 'welcome-banner';
        newHeader.style.height = header.offsetHeight + 'px';
        newHeader.innerHTML = closeBtn + msg;
        newHeader.className += 'u-faux-block-link__promote';

        newHeader.setAttribute('data-link-name', 'welcome-banner');

        document.querySelector(newHeader).addEventListener('click', function () {
            fastdom.write(function () {
                newHeader.style.display = 'none';
            });
        });

        header.getElementsByClassName('l-header-main')[0].style.zIndex = 1200;
        header.appendChild(newHeader);

        setTimeout(function(){
            newHeader.style.opacity = 1;
        }, 0);
    }

    return {
        showWelcomeMessage: showWelcomeMessage
    };
});
