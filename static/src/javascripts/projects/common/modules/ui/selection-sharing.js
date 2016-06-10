define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/client-rects',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'text!common/views/ui/selection-sharing.html',
    'text!common/views/ui/comment-box.html',
    'text!common/views/ui/results-box.html',
    'common/views/svgs',
    'lodash/functions/debounce',
    'lodash/functions/throttle',
    'lodash/collections/some',
    'common/utils/storage'
], function (
    bean,
    bonzo,
    $,
    clientRects,
    config,
    detect,
    mediator,
    template,
    sharingTemplate,
    commentTemplate,
    resultsTemplate,
    svgs,
    debounce,
    throttle,
    some,
    storage
) {

    var $body = bonzo(document.body),
        wikiIcon = svgs('searchWiki', ['icon']),
        commentIcon = svgs('commentInline', ['icon']),
        shareIcon = svgs('share', ['icon']),
        searchIcon = svgs('search', ['icon']),
        flagIcon = svgs('flag', ['icon']),
        googleIcon = svgs('searchGoogle', ['icon']),
        twitterIcon = svgs('shareTwitter', ['icon']),
        emailIcon = svgs('shareEmail', ['icon']),
        selectionSharing = template(sharingTemplate, {
            wikiIcon: wikiIcon,
            commentIcon: commentIcon,
            shareIcon: shareIcon,
            searchIcon: searchIcon,
            flagIcon: flagIcon,
            googleIcon: googleIcon,
            twitterIcon: twitterIcon,
            emailIcon: emailIcon
        }),
        $selectionSharing = $.create(selectionSharing),
        commentBox = template(commentTemplate, {}),
        $commentBox = $.create(commentBox),
        $wikiAction,
        $flagAction,
        $googleAction,
        $twitterAction,
        $emailAction,
        wikiHrefTemplate = 'https://en.wikipedia.org/wiki/<%=text%>',
        googleHrefTemplate = 'https://www.google.co.uk/search?q=<%=text%>',
        flagHrefTemplate = 'https://twitter.com/intent/tweet?text=%E2%80%9C<%=text%>%E2%80%9D%20...Are you sure about that @guardian?&url=<%=url%>',
        twitterShortUrl = config.page.shortUrl + '/stw',
        twitterHrefTemplate = 'https://twitter.com/intent/tweet?text=%E2%80%9C<%=text%>%E2%80%9D&url=<%=url%>',
        twitterMessageLimit = 114, // 140 - t.co length - 3 chars for quotes and url spacing
        emailShortUrl = config.page.shortUrl + '/sbl',
        emailHrefTemplate = 'mailto:?subject=<%=subject%>&body=%E2%80%9C<%=selection%>%E2%80%9D <%=url%>',
        validAncestors = ['js-article__body', 'content__standfirst', 'block', 'caption--main', 'content__headline'],
        lastSelection,
        lastRange,

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

    toggleCommentBox = function (e) {
        var selection = window.getSelection && document.createRange && window.getSelection(),
            range,
            rect,
            top;

        if (!$commentBox.hasClass('u-h')) {
            $commentBox.addClass('u-h');
        } else {
            range = selection.getRangeAt(0);
            rect = clientRects.getBoundingClientRect(range);
            top = $body.scrollTop() + rect.top - 60;
            $commentBox.removeClass('u-h');
            $commentBox.css({
                top: top + 'px',
                left: rect.left + 180 + 'px'
            });
        }
        e.preventDefault();
    },

    hideCommentBox = function () {
        $commentBox.addClass('u-h');
    },

    updateSelection = function () {
        var selection = window.getSelection && document.createRange && window.getSelection(),
            range,
            rect,
            top,
            wikiHref,
            googleHref,
            flagHref,
            twitterMessage,
            twitterHref,
            emailHref;

        if (selection && selection.rangeCount > 0 && selection.toString()) {
            range = selection.getRangeAt(0);
            rect = clientRects.getBoundingClientRect(range);
            top = $body.scrollTop() + rect.top;
            twitterMessage = range.toString();
            lastSelection = selection.toString();
            lastRange = range.cloneRange();

            if (!isValidSelection(range)) {
                hideSelection();
                return;
            }

            // Truncate the twitter message.
            if (twitterMessage.length > twitterMessageLimit) {
                twitterMessage = twitterMessage.slice(0, twitterMessageLimit - 1) + '…';
            }

            wikiHref = template(wikiHrefTemplate, {
                text: encodeURI(range.toString())
            });
            googleHref = template(googleHrefTemplate, {
                text: encodeURI(range.toString())
            });
            twitterHref = template(twitterHrefTemplate, {
                text: encodeURIComponent(twitterMessage),
                url: encodeURI(twitterShortUrl)
            });
            flagHref = template(flagHrefTemplate, {
                text: encodeURIComponent(twitterMessage),
                url: encodeURI(twitterShortUrl)
            });
            emailHref = template(emailHrefTemplate, {
                subject: encodeURI(config.page.webTitle),
                selection: encodeURI(range.toString()),
                url: encodeURI(emailShortUrl)
            });

            $wikiAction.attr('href', wikiHref);
            $googleAction.attr('href', googleHref);
            $twitterAction.attr('href', twitterHref);
            $flagAction.attr('href', flagHref);
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

    showComment = function (selection) {
        var resultsBox = template(resultsTemplate, {
                comment: selection
            }),
            $resultsBox = $.create(resultsBox);

        $body.append($resultsBox);
        $resultsBox.removeClass('u-h');
    },

    submitComment = function () {
        if (lastSelection && lastRange) {
            storage.local.set(lastSelection, $('.d-comment-box__body')[0].value);
            $commentBox.addClass('u-h');

            var newNode = document.createElement('span');
            newNode.setAttribute('style', 'background-color: pink;');
            newNode.setAttribute('class', 'commented-phase');
            newNode.setAttribute('data-selection', lastSelection);
            lastRange.surroundContents(newNode);

            bean.on($('.commented-phase')[0], 'click', function () {
                showComment($('.commented-phase').data('selection'));
            });
        }
    },
        
    initSelectionSharing = function () {
        // The current mobile Safari returns absolute Rect co-ordinates (instead of viewport-relative),
        // and the UI is generally fiddly on touch.
        if (!detect.hasTouchScreen()) {
            $body.append($selectionSharing);
            $body.append($commentBox);
            $wikiAction = $('.js-selection-wiki');
            //$commentAction = $('.js-selection-comment');
            $googleAction = $('.js-selection-google');
            $twitterAction = $('.js-selection-twitter');
            $flagAction = $('.js-selection-flag');
            $emailAction = $('.js-selection-email');
            // Set timeout ensures that any existing selection has been cleared.
            bean.on(document.body, 'keypress keydown keyup', debounce(updateSelection, 50));
            bean.on(document.body, 'mouseup', debounce(updateSelection, 200));
            bean.on(document.body, 'mousedown', debounce(onMouseDown, 50));
            bean.on($('.js-selection-comment')[0], 'click', toggleCommentBox);
            bean.on($('.js-article__body')[0], 'click', hideCommentBox);
            bean.on($('.d-comment-box__submit')[0], 'click', submitComment);
            mediator.on('window:resize', throttle(updateSelection, 50));
        }
    };

    return {
        init: initSelectionSharing,
        updateSelection: updateSelection
    };
});
