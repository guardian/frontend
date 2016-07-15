define([
    'lodash/collections/find',
    'common/utils/$'
], function (
    find,
    $
) {

    var $pollElems;

    var pollSubmitted = false;

    var showMessage = false;

    function init(isControl) {
        if (!isControl) {
            showMessage = true;
        }

        $pollElems = $('figure.element-interactive[data-canonical-url*="interactive.guim.co.uk/participation/poll"]');

        window.addEventListener('message', receiveMessage, false);
    }

    function receiveMessage(evt) {
        var pollElem;
        var data;

        if (evt.origin.indexOf('interactive.guim.co.uk') !== -1) {
            data = JSON.parse(evt.data);

            if (data.type && data.type === 'pollPost') {
                pollElem = find($pollElems, matchPostMessageSource.bind(null, evt.source));

                if (pollElem) {
                    pollSubmitted = true;

                    if (showMessage) {
                        showMessageElem(pollElem);
                    }
                }
            }
        }
    }

    function matchPostMessageSource(source, pollElem) {
        var $iframe = $('iframe', pollElem)[0];

        return $iframe.contentWindow === source;
    }

    function showMessageElem(pollElem) {
        var nextSibling = pollElem.nextSibling;
        var messageElem = document.createElement('div');

        messageElem.classList.add('join-discussion-after-poll');
        messageElem.innerHTML = '<p>Thanks for taking part! Why not <a data-link-name="poll: cta: join discussion" href="#comments">join the discussion</a>?</p>';

        if (nextSibling) {
            nextSibling.parentNode.insertBefore(messageElem, nextSibling);
        } else {
            pollElem.parentNode.appendChild(messageElem);
        }

        setTimeout(openMessage.bind(null, messageElem), 50);
    }

    function openMessage(messageElem) {
        messageElem.classList.add('join-discussion-after-poll--open');
    }

    function isComplete() {
        return pollSubmitted;
    }

    return {
        init: init,
        isComplete: isComplete
    };
});
