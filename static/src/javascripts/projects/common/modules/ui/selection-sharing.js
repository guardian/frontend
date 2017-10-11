// @flow
import bean from 'bean';
import Rangefix from 'rangefix';
import $ from 'lib/$';
import config from 'lib/config';
import { hasTouchScreen } from 'lib/detect';
import mediator from 'lib/mediator';
import template from 'lodash/utilities/template';
import { inlineSvg } from 'common/views/svgs';
import debounce from 'lodash/functions/debounce';

const sharingTemplate = `
    <div class="selection-sharing">
        <ul class="social u-unstyled u-cf" data-component="social-selection">
            <li class="social__item" data-link-name="twitter">
                <a  class="rounded-icon social-icon social-icon--twitter js-selection-twitter"
                    data-link-name="social-selection"
                    target="_blank"
                    href="#">
                    <span class="u-h">Share on Twitter</span>
                    <%= twitterIcon %>
                </a>
            </li>
            <li class="social__item" data-link-name="email">
                <a  class="rounded-icon social-icon social-icon--email js-selection-email"
                    data-link-name="social-selection"
                    target="_blank"
                    href="#">
                    <span class="u-h">Share via Email</span>
                    <%= emailIcon %>
                </a>
            </li>
        </ul>
    </div>
`;

const twitterIcon = inlineSvg('shareTwitter', ['icon', 'centered-icon']);
const emailIcon = inlineSvg('shareEmail', ['icon', 'centered-icon']);
const $body = document.body;

const selectionSharing = template(sharingTemplate, {
    twitterIcon,
    emailIcon,
});

const $selectionSharing = $.create(selectionSharing);

let $twitterAction;
let $emailAction;
const twitterShortUrl = `${config.page.shortUrl}/stw`;
const twitterHrefTemplate =
    'https://twitter.com/intent/tweet?text=%E2%80%9C<%=text%>%E2%80%9D&url=<%=url%>';

const // 140 - t.co length - 3 chars for quotes and url spacing
twitterMessageLimit = 114;

const emailShortUrl = `${config.page.shortUrl}/sbl`;
const emailHrefTemplate =
    'mailto:?subject=<%=subject%>&body=%E2%80%9C<%=selection%>%E2%80%9D <%=url%>';
const validAncestors = [
    'js-article__body',
    'content__standfirst',
    'block',
    'caption--main',
    'content__headline',
];

const isValidSelection = (
    range
): boolean => // commonAncestorContainer is buggy, can't use it here.
    validAncestors.some(
        className =>
            $.ancestor(range.startContainer, className) &&
            $.ancestor(range.endContainer, className)
    );

const hideSelection = (): void => {
    if ($selectionSharing.hasClass('selection-sharing--active')) {
        $selectionSharing.removeClass('selection-sharing--active');
    }
};

const showSelection = (): void => {
    if (!$selectionSharing.hasClass('selection-sharing--active')) {
        $selectionSharing.addClass('selection-sharing--active');
    }
};

const updateSelection = (): void => {
    const selection =
        window.getSelection && document.createRange && window.getSelection();
    let range;
    let rect;
    let top;
    let twitterMessage;
    let twitterHref;
    let emailHref;

    if (
        $body &&
        selection &&
        selection.rangeCount > 0 &&
        selection.toString()
    ) {
        range = selection.getRangeAt(0);
        rect = Rangefix.getBoundingClientRect(range);
        top = $body.scrollTop + rect.top;
        twitterMessage = range.toString();

        if (!isValidSelection(range)) {
            hideSelection();
            return;
        }

        // Truncate the twitter message.
        if (twitterMessage.length > twitterMessageLimit) {
            twitterMessage = `${twitterMessage.slice(
                0,
                twitterMessageLimit - 1
            )}…`;
        }

        twitterHref = template(twitterHrefTemplate, {
            text: encodeURIComponent(twitterMessage),
            url: encodeURI(twitterShortUrl),
        });
        emailHref = template(emailHrefTemplate, {
            subject: encodeURI(config.page.webTitle),
            selection: encodeURI(range.toString()),
            url: encodeURI(emailShortUrl),
        });

        $twitterAction.attr('href', twitterHref);
        $emailAction.attr('href', emailHref);

        $selectionSharing.css({
            top: `${top}px`,
            left: `${rect.left}px`,
        });

        showSelection();
    } else {
        hideSelection();
    }
};

const onMouseDown = (event): void => {
    if (!$.ancestor(event.target, 'social__item')) {
        hideSelection();
    }
};

const init = (): void => {
    // The current mobile Safari returns absolute Rect co-ordinates (instead of viewport-relative),
    // and the UI is generally fiddly on touch.
    if ($body && !hasTouchScreen()) {
        $body.appendChild($selectionSharing[0]);

        $twitterAction = $('.js-selection-twitter');
        $emailAction = $('.js-selection-email');
        // Set timeout ensures that any existing selection has been cleared.
        bean.on(
            document.body,
            'keypress keydown keyup',
            debounce(updateSelection, 50)
        );
        bean.on(document.body, 'mouseup', debounce(updateSelection, 200));
        bean.on(document.body, 'mousedown', debounce(onMouseDown, 50));
        mediator.on('window:throttledResize', updateSelection);
    }
};

export { init, updateSelection };
