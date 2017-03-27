define([
    'bean',
    'bonzo',
    'lib/$',
    'lib/client-rects',
    'lib/config',
    'lib/detect',
    'lib/mediator',
    'lodash/utilities/template',
    'raw-loader!common/views/ui/selection-sharing.html',
    'raw-loader!common/views/ui/selection-validate-edit.html',
    'common/views/svgs',
    'lodash/functions/debounce',
    'lodash/collections/some',
    'ophan/ng'
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
    validateTemplate,
    svgs,
    debounce,
    some,
    ophan
) {

    var $body = bonzo(document.body),
        editIcon = svgs('quoteIcon', ['icon', 'centered-icon']),
        wrongIcon = svgs('crossIcon', ['icon', 'centered-icon']),
        commentIcon = svgs('comment16icon', ['icon', 'centered-icon']),
        exploreIcon = svgs('searchIcon', ['icon', 'centered-icon']),
        validateIcon = svgs('tick', ['icon', 'centered-icon']),
        cancelIcon = svgs('crossIcon', ['icon', 'centered-icon']),
        selectionSharing = template(sharingTemplate, {
            editIcon: editIcon,
            wrongIcon: wrongIcon,
            commentIcon: commentIcon,
            exploreIcon: exploreIcon
        }),
        $selectionSharing = $.create(selectionSharing),
        selectionValidateEdit = template(validateTemplate, {
            validateIcon: validateIcon,
            cancelIcon: cancelIcon,
        }),
        $selectionValidateEdit = $.create(selectionValidateEdit),
        $editAction,
        $disagreeAction,
        $validateEditAction,
        $cancelEditAction,
        emailShortUrl = config.page.shortUrl + '/sbl',
        emailHrefTemplate = 'mailto:?subject=<%=subject%>&body=%E2%80%9C<%=selection%>%E2%80%9D <%=url%>',
        validAncestors = ['js-article__body', 'content__standfirst', 'block', 'caption--main', 'content__headline'],
        selectionNode,
        selectionNodeCopy,
        selectionRect,

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

    hideValidate = function () {
        if ($selectionValidateEdit.hasClass('selection-sharing--active')) {
            $selectionValidateEdit.removeClass('selection-sharing--active');
        }
    },

    showValidate = function () {
        if (!$selectionValidateEdit.hasClass('selection-sharing--active')) {
            $selectionValidateEdit.addClass('selection-sharing--active');
        }
    },

    updateSelection = function () {

        var selection = window.getSelection && document.createRange && window.getSelection(),
            range,
            rect,
            top,
            twitterMessage,
            editHref,
            disagreeHref;

        if (selection && selection.rangeCount > 0 && selection.toString()) {
            range = selection.getRangeAt(0);
            rect = clientRects.getBoundingClientRect(range);


            selectionNode = selection.anchorNode.parentNode;
            selectionNodeCopy = selectionNode && selectionNode.cloneNode(true);
            selectionRect = rect;
            
            //TODO extract from the range entities and find related questions 
            // explainers http://internal.content.guardianapis.com/atoms?types=explainer&page-size=200&q=brexit&searchFields=data.title
            // question and answers 

            twitterMessage = range.toString();


            if (!isValidSelection(range)) {
                hideSelection();
                return;
            }

            // Truncate the twitter message.
            //if (twitterMessage.length > twitterMessageLimit) {
            //    twitterMessage = twitterMessage.slice(0, twitterMessageLimit - 1) + '…';
            //}

            disagreeHref = template(emailHrefTemplate, {
                subject: encodeURI(config.page.webTitle),
                selection: encodeURI(range.toString()),
                url: encodeURI(emailShortUrl)
            });

            //$editAction.attr('href', agreeHref);
            $disagreeAction.attr('href', disagreeHref);

            top = $body.scrollTop() + rect.top;
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


    onEditStart = function (event) {
        event.preventDefault();
        if (selectionNode) {

            //set content as editable
            selectionNode.setAttribute("contenteditable", "true");
            
            //correctly position edition validation
            var top = $body.scrollTop() + selectionRect.top;
            var left = selectionRect.left;
            $selectionValidateEdit.css({
                top: top + 'px',
                left:left + 'px'
            });
            
            // hide selection UI by clearing selection range and display validation UI 
            var selection = window.getSelection && window.getSelection();
            if (selection) {
                selection.removeAllRanges();
            }
            selectionNode.focus();
            showValidate();
        }
    },

    onEditValidate = function (event) {
        event.preventDefault();
        if (selectionNode) {
            selectionNode.setAttribute("contenteditable", "false");
            hideValidate();
            selectionNode.parentNode.replaceChild(selectionNodeCopy, selectionNode)
            selectionNode = null;
             ophan.record({
                component: 'feedback',
                value: selectionNode.innerText
            });
        }
    },

    onEditCancel = function (event) {
        event.preventDefault();
        if (selectionNode) {
            selectionNode.setAttribute("contenteditable", "false");
            hideValidate();
            selectionNode.parent.replaceChild(selectionNodeCopy, selectionNode)
            selectionNode = null;
        }
    },


    initSelectionSharing = function () {
        // The current mobile Safari returns absolute Rect co-ordinates (instead of viewport-relative),
        // and the UI is generally fiddly on touch.
        if (!detect.hasTouchScreen()) {
            $body.append($selectionSharing);
            $body.append($selectionValidateEdit);
            $editAction = $('.js-selection-edit');
            $disagreeAction = $('.js-selection-wrong');

            $validateEditAction =$('.js-selection-edit-validate');
            $cancelEditAction =$('.js-selection-edit-cancel');
            

            bean.on($editAction[0], 'click', onEditStart);
            bean.on($validateEditAction[0], 'click', onEditValidate);
            bean.on($cancelEditAction[0], 'click', onEditCancel);


            // Set timeout ensures that any existing selection has been cleared.
            bean.on(document.body, 'keypress keydown keyup', debounce(updateSelection, 50));
            bean.on(document.body, 'mouseup', debounce(updateSelection, 200));
            bean.on(document.body, 'mousedown', debounce(onMouseDown, 50));
            mediator.on('window:throttledResize', updateSelection);
        }
    };

    return {
        init: initSelectionSharing,
        updateSelection: updateSelection
    };
});
