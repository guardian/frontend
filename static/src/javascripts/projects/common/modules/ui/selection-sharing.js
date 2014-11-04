define([
    'bean',
    'bonzo',
    'common/utils/_',
    'common/utils/$',
    'common/utils/client-rects',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'text!common/views/ui/selection-sharing.html'
], function (
    bean,
    bonzo,
    _,
    $,
    clientRects,
    config,
    detect,
    mediator,
    template,
    sharingTemplate
    ) {

    var $body = bonzo(document.body),
        $selectionSharing = $.create(sharingTemplate),
        $twitterAction,
        $emailAction,
        twitterShortUrl = config.page.shortUrl + '/stw',
        twitterHrefTemplate = 'https://twitter.com/intent/tweet?text="{{text}}"&url={{url}}',
        twitterMessageLimit = 115, // 140 - t.co length - 3 chars for quotes and url spacing
        emailShortUrl = config.page.shortUrl + '/sbl',
        emailHrefTemplate = 'mailto:?subject={{subject}}&body="{{selection}}" {{url}}',

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
            top = $body.scrollTop() + rect.bottom;
            twitterMessage = range.toString();

            // commonAncestorContainer is buggy, can't use it here.
            if (!$.ancestor(range.startContainer, 'js-article__body') ||
                !$.ancestor(range.endContainer, 'js-article__body')) {
                hideSelection();
                return;
            }

            // Truncate the twitter message.
            if (twitterMessage.length > twitterMessageLimit) {
                twitterMessage = twitterMessage.slice(0, twitterMessageLimit - 1) + '…';
            }

            twitterHref = template(twitterHrefTemplate, {
                text: encodeURI(twitterMessage),
                url: encodeURI(twitterShortUrl)
            });
            emailHref = template(emailHrefTemplate, {
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

    initSelectionSharing = function () {
        // The current mobile Safari returns absolute Rect co-ordinates (instead of viewport-relative),
        // and the UI is generally fiddly on touch.
        if (!detect.hasTouchScreen()) {
            $body.append($selectionSharing);
            $twitterAction = $('.social__item--twitter .social__action');
            $emailAction = $('.social__item--email .social__action');
            // Set timeout ensures that any existing selection has been cleared.
            bean.on(document.body, 'keypress keydown keyup', _.debounce(updateSelection, 50));
            bean.on(document.body, 'mouseup', _.debounce(updateSelection, 200));
            bean.on(document.body, 'mousedown', _.debounce(hideSelection, 50));
            mediator.on('window:resize', _.throttle(updateSelection, 50));
        }
    };

    return {
        init: initSelectionSharing,
        updateSelection: updateSelection
    };
});
