import bean from 'bean';
import bonzo from 'bonzo';
import Rangefix from 'rangefix';
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import mediator from 'lib/mediator';
import template from 'lodash/utilities/template';
import sharingTemplate from 'raw-loader!common/views/ui/selection-sharing.html';
import svgs from 'common/views/svgs';
import debounce from 'lodash/functions/debounce';
import some from 'lodash/collections/some';

const $body = bonzo(document.body);
const twitterIcon = svgs.inlineSvg('shareTwitter', ['icon', 'centered-icon']);
const emailIcon = svgs.inlineSvg('shareEmail', ['icon', 'centered-icon']);

const selectionSharing = template(sharingTemplate, {
    twitterIcon,
    emailIcon
});

const $selectionSharing = $.create(selectionSharing);
let $twitterAction;
let $emailAction;
const twitterShortUrl = config.page.shortUrl + '/stw';
const twitterHrefTemplate = 'https://twitter.com/intent/tweet?text=%E2%80%9C<%=text%>%E2%80%9D&url=<%=url%>';

const // 140 - t.co length - 3 chars for quotes and url spacing
twitterMessageLimit = 114;

const emailShortUrl = config.page.shortUrl + '/sbl';
const emailHrefTemplate = 'mailto:?subject=<%=subject%>&body=%E2%80%9C<%=selection%>%E2%80%9D <%=url%>';
const validAncestors = ['js-article__body', 'content__standfirst', 'block', 'caption--main', 'content__headline'];

const isValidSelection = range => // commonAncestorContainer is buggy, can't use it here.
some(
    validAncestors,
    className => $.ancestor(range.startContainer, className) && $.ancestor(range.endContainer, className)
);

const hideSelection = () => {
    if ($selectionSharing.hasClass('selection-sharing--active')) {
        $selectionSharing.removeClass('selection-sharing--active');
    }
};

const showSelection = () => {
    if (!$selectionSharing.hasClass('selection-sharing--active')) {
        $selectionSharing.addClass('selection-sharing--active');
    }
};

const updateSelection = () => {
    const selection = window.getSelection && document.createRange && window.getSelection();
    let range;
    let rect;
    let top;
    let twitterMessage;
    let twitterHref;
    let emailHref;

    if (selection && selection.rangeCount > 0 && selection.toString()) {
        range = selection.getRangeAt(0);
        rect = Rangefix.getBoundingClientRect(range);
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

        twitterHref = template(twitterHrefTemplate, {
            text: encodeURIComponent(twitterMessage),
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
};

const onMouseDown = event => {
    if (!$.ancestor(event.target, 'social__item')) {
        hideSelection();
    }
};

const initSelectionSharing = () => {
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
        mediator.on('window:throttledResize', updateSelection);
    }
};

export default {
    init: initSelectionSharing,
    updateSelection
};
