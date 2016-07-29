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
    'text!common/views/ui/results-box.html',
    'text!common/views/ui/social-icons.html',
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
    resultsTemplate,
    socialIconsTemplate,
    svgs,
    debounce,
    throttle,
    some
) {

    var $body = bonzo(document.body),
        wikiIcon = svgs('searchWiki', ['icon']),
        shareIcon = svgs('shareSmall', ['icon']),
        searchIcon = svgs('search', ['icon']),
        flagIcon = svgs('flag', ['icon']),
        googleIcon = svgs('searchGoogle', ['icon']),
        twitterIcon = svgs('shareTwitter', ['icon']),
        emailIcon = svgs('shareEmail', ['icon']),
        selectionSharing = template(sharingTemplate, {
            wikiIcon: wikiIcon,
            shareIcon: shareIcon,
            searchIcon: searchIcon,
            flagIcon: flagIcon,
            googleIcon: googleIcon,
            twitterIcon: twitterIcon,
            emailIcon: emailIcon
        }),
        $selectionSharing = $.create(selectionSharing),
        socialIconsBox = template(socialIconsTemplate, {
          twitterIcon: twitterIcon,
          emailIcon: emailIcon
        }),
        $socialIconsBox = $.create(socialIconsBox),
        $wikiAction,
        $flagAction,
        $googleAction,
        $twitterAction,
        $emailAction,
        wikiHrefTemplate = 'https://en.wikipedia.org/wiki/<%=text%>',
        googleHrefTemplate = 'https://www.google.co.uk/search?q=<%=text%>',
        flagHrefTemplate = 'mailto:userhelp@theguardian.com?subject=Issue spotted on %E2%80%9C<%=subject%>%E2%80%9D&body=Dear Guardian User Help, %0A%0AI noticed an issue while reading the following article: %0A%0A%E2%80%9C<%=subject%>%E2%80%9D, seen at <%=url%> %0A%0ASee pasted below the section in question: %0A%0A%E2%80%9C<%=selection%>%E2%80%9D%0A%0ACould this be checked for accuracy please?%0A%0AYours,%0A%0AA concerned reader',
        twitterUrl = 'https://www.' + config.page.publication + '/' + config.page.pageId + '?CMP=share_btn_link',
        twitterHrefTemplate = 'https://twitter.com/intent/tweet?text=%E2%80%9C<%=text%>%E2%80%9D&url=<%=url%>',
        twitterMessageLimit = 114, // 140 - t.co length - 3 chars for quotes and url spacing
        emailUrl = 'https://www.' + config.page.publication + '/' + config.page.pageId + '?CMP=share_btn_link',
        emailFlagUrl = 'https://www.' + config.page.publication + '/' + config.page.pageId,
        emailHrefTemplate = 'mailto:?subject=<%=subject%>&body=%E2%80%9C<%=selection%>%E2%80%9D <%=url%>',
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
                url: encodeURI(twitterUrl)
            });
            flagHref = template(flagHrefTemplate, {
                subject: encodeURI(config.page.webTitle),
                selection: encodeURI(range.toString()),
                url: encodeURI(emailFlagUrl)
            });
            emailHref = template(emailHrefTemplate, {
                subject: encodeURI(config.page.webTitle),
                selection: encodeURI(range.toString()),
                url: encodeURI(emailUrl)
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

    toggleShareIcons = function(e) {
      if (!$socialIconsBox.hasClass('u-h')) {
          $socialIconsBox.addClass('u-h');
      } else {
          $socialIconsBox.removeClass('u-h');
          $socialIconsBox.css({
              top: '1000 px',
              left: '10 px'
          });
      }
      e.preventDefault();
    },

    initSelectionSharing = function () {
        // The current mobile Safari returns absolute Rect co-ordinates (instead of viewport-relative),
        // and the UI is generally fiddly on touch.
        if (!detect.hasTouchScreen()) {
            $body.append($selectionSharing);
            $('.selection-sharing').append($socialIconsBox);
            $socialIconsBox.addClass('u-h');
            $wikiAction = $('.js-selection-wiki');
            $googleAction = $('.js-selection-google');
            $twitterAction = $('.js-selection-twitter');
            $flagAction = $('.js-selection-flag');
            $emailAction = $('.js-selection-email');

            // Set timeout ensures that any existing selection has been cleared.
            bean.on(document.body, 'keypress keydown keyup', debounce(updateSelection, 50));
            bean.on(document.body, 'mouseup', debounce(updateSelection, 200));
            bean.on(document.body, 'mousedown', debounce(onMouseDown, 50));
            bean.on($('.js-selection-share')[0], 'click', toggleShareIcons);
            mediator.on('window:resize', throttle(updateSelection, 50));
        }
    };

    return {
        init: initSelectionSharing,
        updateSelection: updateSelection
    };
});
