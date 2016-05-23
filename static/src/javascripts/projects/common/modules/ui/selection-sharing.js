define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/client-rects',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'tpl!common/views/ui/selection-sharing.html',
    'tpl!common/views/ui/twitter-sharing-url.html',
    'tpl!common/views/ui/email-sharing-url.html',
    'common/views/svgs',
    'lodash/functions/debounce',
    'lodash/functions/throttle',
    'lodash/collections/some'
], function (
    bean,
    bonzo,
    $,
    clientRects,
    config,
    detect,
    mediator,
    sharingTemplate,
    twitterHrefTemplate,
    emailHrefTemplate,
    svgs,
    debounce,
    throttle,
    some
) {

    var $body = bonzo(document.body),
        twitterIcon = svgs('shareTwitter', ['icon']),
        emailIcon = svgs('shareEmail', ['icon']),
        selectionSharing = sharingTemplate({
            twitterIcon: twitterIcon,
            emailIcon: emailIcon
        }),
        $selectionSharing = $.create(selectionSharing),
        $twitterAction,
        $emailAction,
        twitterShortUrl = config.page.shortUrl + '/stw',
        twitterMessageLimit = 114, // 140 - t.co length - 3 chars for quotes and url spacing
        emailShortUrl = config.page.shortUrl + '/sbl',
        validAncestors = ['js-article__body', 'content__standfirst', 'block', 'caption--main', 'content__headline'],

    isValidSelection = function (range) {
        // commonAncestorContainer is buggy, can't use it here.
        return some(validAncestors, function (className) {
            return $.ancestor(range.startContainer, className) && $.ancestor(range.endContainer, className);
        });
    },

    hideSelection = function () {
        if ($selectionSharing.hasClass('selection-sharing--active')) {
            $selectionSharing.removeClass('selection-sharing--active');
        }
    },

    showSelection = function () {
        if (!$selectionSharing.hasClass('selection-sharing--active')) {
            $selectionSharing.addClass('selection-sharing--active');
        }
    },

    updateSelection = function () {

        var selection = window.getSelection && document.createRange && window.getSelection(),
            range,
            rect,
            top,
            twitterMessage,
            twitterHref,
            emailHref;

        if (selection && selection.rangeCount > 0 && selection.toString()) {
            range = selection.getRangeAt(0);
            rect = clientRects.getBoundingClientRect(range);
            top = $body.scrollTop() + rect.top;
            twitterMessage = range.toString();

            if (!isValidSelection(range)) {
                hideSelection();
                return;
            }

            // Truncate the twitter message.
            if (twitterMessage.length > twitterMessageLimit) {
                twitterMessage = twitterMessage.slice(0, twitterMessageLimit - 1) + '…';
            }

            twitterHref = twitterHrefTemplate({
                text: encodeURIComponent(twitterMessage),
                url: encodeURI(twitterShortUrl)
            });
            emailHref = emailHrefTemplate({
                subject: encodeURI(config.page.webTitle),
                selection: encodeURI(range.toString()),
                url: encodeURI(emailShortUrl)
            });

            $twitterAction.attr('href', twitterHref);
            $emailAction.attr('href', emailHref);

            $selectionSharing.css({
                top: top + 'px',
                left: rect.left + 'px'
            });

            showSelection();
        } else {
            hideSelection();
        }
    },

    onMouseDown = function (event) {
        if (!$.ancestor(event.target, 'social__item')) {
            hideSelection();
        }
    },

    initSelectionSharing = function () {
        // The current mobile Safari returns absolute Rect co-ordinates (instead of viewport-relative),
        // and the UI is generally fiddly on touch.
        if (!detect.hasTouchScreen()) {
            $body.append($selectionSharing);
            $twitterAction = $('.js-selection-twitter');
            $emailAction = $('.js-selection-email');
            // Set timeout ensures that any existing selection has been cleared.
            bean.on(document.body, 'keypress keydown keyup', debounce(updateSelection, 50));
            bean.on(document.body, 'mouseup', debounce(updateSelection, 200));
            bean.on(document.body, 'mousedown', debounce(onMouseDown, 50));
            mediator.on('window:resize', throttle(updateSelection, 50));
        }
    };

    return {
        init: initSelectionSharing,
        updateSelection: updateSelection
    };
});
