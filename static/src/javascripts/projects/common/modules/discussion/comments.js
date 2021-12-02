import $ from 'lib/$';
import bean from 'bean';
import bonzo from 'bonzo';
import qwery from 'qwery';
import config from 'lib/config';
import { fetchJson } from 'lib/fetch-json';
import { mediator } from 'lib/mediator';
import reportError from 'lib/report-error';
import { constructQuery } from 'lib/url';
import { Component } from 'common/modules/component';
import {
    reportComment,
    pickComment,
    unPickComment,
} from 'common/modules/discussion/api';
import { CommentBox } from 'common/modules/discussion/comment-box';
import { WholeDiscussion } from 'common/modules/discussion/whole-discussion';
import { init as initRelativeDates } from 'common/modules/ui/relativedates';
import userPrefs from 'common/modules/user-prefs';
import { inlineSvg } from 'common/views/svgs';


const PREF_RELATIVE_TIMESTAMPS = 'discussion.enableRelativeTimestamps';

const shouldMakeTimestampsRelative = () =>
    userPrefs.get(PREF_RELATIVE_TIMESTAMPS) !== null
        ? userPrefs.get(PREF_RELATIVE_TIMESTAMPS)
        : true;

class Comments extends Component {
    constructor(options) {
        super();

        this.componentClass = 'd-comments';
        this.comments = null;
        this.topLevelComments = null;
        this.user = null;
        this.classes = {
            comments: 'd-thread--top-level',
            topLevelComment: 'd-comment--top-level',
            reply: 'd-comment--response',
            showReplies: 'd-show-more-replies',
            showRepliesButton: 'd-show-more-replies__button',
            newComments: 'js-new-comments',
            comment: 'd-comment',
            commentReply: 'd-comment__action--reply',
            commentPick: 'd-comment__action--pick',
            commentStaff: 'd-comment--staff',
            commentBody: 'd-comment__body',
            commentTimestampJs: 'js-timestamp',
            commentReport: 'js-report-comment',
        };
        this.defaultOptions = {
            discussionId: null,
            showRepliesCount: 3,
            commentId: null,
            order: 'newest',
            threading: 'collapsed',
        };

        this.setOptions(options);
    }

    getMoreReplies(event) {
        event.preventDefault();

        const target = (event.target);
        const currentTarget = (event.currentTarget);
        const li = currentTarget.closest(this.getClass('showReplies'));

        if (li) {
            li.innerHTML = 'Loading…';
        }

        const source = bonzo(target).data('source-comment');
        const commentId = currentTarget.getAttribute('data-comment-id');

        if (commentId) {
            const endpoint = `/discussion/comment/${commentId}.json?displayThreaded=true`;

            fetchJson(endpoint, {
                mode: 'cors',
            })
                .then(resp => {
                    const comment = bonzo.create(resp.html);
                    const replies = qwery(
                        this.getClass('reply'),
                        comment
                    ).slice(this.options && this.options.showRepliesCount);

                    bonzo(qwery('.d-thread--responses', source)).append(
                        replies
                    );
                    bonzo(li).addClass('u-h');

                    this.emit('untruncate-thread');

                    if (shouldMakeTimestampsRelative()) {
                        this.relativeDates();
                    }
                })
                .catch(ex => {
                    reportError(ex, {
                        feature: 'comments-more-replies',
                    });
                });
        }
    }



    addMoreRepliesButtons(comms) {
        const comments = comms || this.topLevelComments;

        comments.forEach(elem => {
            const replies = parseInt(
                elem.getAttribute('data-comment-replies'),
                10
            );
            const renderedReplies = qwery(this.getClass('reply'), elem);

            if (renderedReplies.length < replies) {
                const numHiddenReplies = replies - renderedReplies.length;
                const plusIcon = inlineSvg('plus', ['icon']);
                const repliesStr = numHiddenReplies === 1 ? 'reply' : 'replies';
                const btnMarkup = `
                    <button class="u-button-reset button button--show-more button--small button--tone-news d-show-more-replies__button">
                        ${plusIcon}Show ${numHiddenReplies} more ${repliesStr}
                    </button>`;
                const $btn = $.create(btnMarkup)
                    .attr({
                        'data-link-name': 'Show more replies',
                        'data-is-ajax': '',
                        'data-comment-id': elem.getAttribute('data-comment-id'),
                    })
                    .data('source-comment', elem);

                $.create(
                    `<li class="${this.getClass('showReplies', true)}"></li>`
                )
                    .append($btn)
                    .appendTo($('.d-thread--responses', elem));
            }
        });
    }

    fetchComments(options = {}) {
        const { discussionId } = this.options || {};
        const url = `/discussion/${
            options.comment
                ? `comment-context/${options.comment}`
                : discussionId
        }.json`;
        let orderBy = options.order || (this.options && this.options.order);
        let promise;
        const ajaxParams = { mode: 'cors' };

        if (orderBy === 'recommendations') {
            orderBy = 'mostRecommended';
        }

        const queryParams = {
            orderBy,
            pageSize:
                options.pagesize || (this.options && this.options.pagesize),
            displayThreaded: !!(
                this.options && this.options.threading !== 'unthreaded'
            ),
            commentsClosed: options.commentsClosed,
        };

        if (options.page) {
            queryParams.page = options.page;
        }

        if (
            !options.comment &&
            this.options &&
            this.options.threading === 'collapsed'
        ) {
            queryParams.maxResponses = 3;
        }

        if (this.isAllPageSizeActive()) {
            promise = new WholeDiscussion({
                discussionId: this.options && this.options.discussionId,
                orderBy: queryParams.orderBy,
                displayThreaded: queryParams.displayThreaded,
                maxResponses: queryParams.maxResponses,
                commentsClosed: queryParams.commentsClosed,
            })
                .loadAllComments()
                .catch(() => {
                    this.wholeDiscussionErrors = true;
                    queryParams.pageSize = 100;

                    return fetchJson(
                        `${url}?${constructQuery(queryParams)}`,
                        ajaxParams
                    );
                });
        } else {
            // It is possible that the user has chosen to view all comments,
            // but the WholeDiscussion module has failed. Fall back to 100 comments.
            if (queryParams.pageSize === 'All') {
                queryParams.pageSize = 100;
            }

            promise = fetchJson(
                `${url}?${constructQuery(queryParams)}`,
                ajaxParams
            );
        }

        return promise.then(resp => this.renderComments(resp));
    }

    handlePickClick(e) {
        e.preventDefault();

        const target = (e.target);
        const commentId = target.getAttribute('data-comment-id');
        const $thisButton = $(target);
        const highlighted = $thisButton[0].getAttribute(
            'data-comment-highlighted'
        );
        const action =
            highlighted === 'true' ? this.unPickComment : this.pickComment;

        if (commentId) {
            action.call(this, commentId, $thisButton).catch(resp => {
                const responseText =
                    resp.response.length > 0
                        ? JSON.parse(resp.response).message
                        : resp.statusText;

                $thisButton.text(responseText);
            });
        }
    }

    pickComment(commentId, $thisButton) {
        const comment = qwery(`#comment-${commentId}`, this.elem);

        return pickComment(commentId).then(() => {
            $(this.getClass('commentPick'), comment).removeClass('u-h');
            $thisButton.text('Unpick');
            comment.setAttribute('data-comment-highlighted', true);
        });
    }

    ready() {
        this.topLevelComments = qwery(
            this.getClass('topLevelComment'),
            this.elem
        );
        this.comments = qwery(this.getClass('comment'), this.elem);

        this.on('click', this.getClass('showRepliesButton'), (event) =>
            this.getMoreReplies(event)
        );

        this.on('click', this.getClass('commentReport'), (event) =>
            this.reportComment(event)
        );

        if (shouldMakeTimestampsRelative()) {
            window.setInterval(() => this.relativeDates(), 60000);
            this.relativeDates();
        }

        this.emit('ready');

        this.on('click', '.js-report-comment-close', () => {
            const commentForm = document.querySelector(
                '.js-report-comment-form'
            );

            if (commentForm) {
                commentForm.setAttribute('hidden', '');
            }
        });
    }

    showHiddenComments(e) {
        if (e) {
            e.preventDefault();
        }

        this.emit('first-load');

        $('.js-discussion-main-comments').css('display', 'block');

        if (shouldMakeTimestampsRelative()) {
            this.relativeDates();
        }
    }

    unPickComment(commentId, $thisButton) {
        const comment = qwery(`#comment-${commentId}`);

        return unPickComment(commentId).then(() => {
            $(this.getClass('commentPick'), comment).addClass('u-h');
            $thisButton.text('Pick');
            comment.setAttribute('data-comment-highlighted', false);
        });
    }

    isReadOnly() {
        return !!(
            this.elem &&
            this.elem instanceof HTMLElement &&
            this.elem.getAttribute('data-read-only') === 'true'
        );
    }

    addComment(comment, parent) {
        const commentElem = bonzo.create(this.postedCommentEl)[0];
        const $commentElem = bonzo(commentElem);
        const replyButton =
            commentElem &&
            commentElem.getElementsByClassName(
                this.getClass('commentReply', true)
            )[0];
        const map = {
            username: 'd-comment__author',
            timestamp: 'js-timestamp',
            body: 'd-comment__body',
            report: 'd-comment__action--report',
            avatar: 'd-comment__avatar',
        };
        const vals = {
            username: this.user && this.user.displayName,
            timestamp: 'Just now',
            body: `<p>${comment.body.replace(/\n+/g, '</p><p>')}</p>`,
            report: {
                href: `http://discussion.theguardian.com/components/report-abuse/${
                    comment.id
                }`,
            },
            avatar: {
                src: this.user && this.user.avatar,
            },
        };

        $commentElem.addClass('d-comment--new');

        Object.keys(map).forEach(key => {
            const selector = map[key];
            const val = vals[key];
            const elem = qwery(`.${selector}`, commentElem)[0];

            if (typeof val === 'string') {
                elem.innerHTML = val;
            } else if (typeof val === 'object') {
                Object.keys(val).forEach(attr => {
                    elem.setAttribute(attr, val[attr]);
                });
            }
        });

        commentElem.id = `comment-${comment.id}`;

        if (this.user && !this.user.isStaff) {
            $commentElem.addClass(this.getClass('commentStaff', true));
        }

        if (replyButton) {
            replyButton.setAttribute('data-comment-id', comment.id);
        }

        if (!parent) {
            $(this.getClass('newComments'), this.elem).prepend(commentElem);
        } else {
            $commentElem.removeClass(this.getClass('topLevelComment', true));
            $commentElem.addClass(this.getClass('reply', true));
            bonzo(parent).append($commentElem);
        }

        window.location.replace(`#comment-${comment.id}`);
    }

    replyToComment(e) {
        e.preventDefault();

        const replyLink = (e.currentTarget);
        const replyToId = replyLink.getAttribute('data-comment-id');

        if (!replyToId) {
            return;
        }

        const replyTo = document.getElementById(`reply-to-${replyToId}`);

        // There is already a comment box for this on the page
        if (replyTo) {
            replyTo.focus();
            return;
        }

        $('.d-comment-box--response').remove();

        const replyToComment = qwery(`#comment-${replyToId}`)[0];
        const replyToAuthor = replyToComment.getAttribute(
            'data-comment-author'
        );
        const replyToAuthorId = replyToComment.getAttribute(
            'data-comment-author-id'
        );
        const $replyToComment = bonzo(replyToComment);
        const replyToBody = qwery(
            this.getClass('commentBody'),
            replyToComment
        )[0].innerHTML;
        const replyToTimestamp = qwery(
            this.getClass('commentTimestampJs'),
            replyToComment
        )[0].innerHTML;
        const commentBox = new CommentBox({
            discussionId: this.options && this.options.discussionId,
            premod:
                this.user &&
                this.user.privateFields &&
                this.user.privateFields.isPremoderated,
            state: 'response',
            replyTo: {
                commentId: replyToId,
                author: replyToAuthor,
                authorId: replyToAuthorId,
                body: replyToBody,
                timestamp: replyToTimestamp,
            },
            focus: true,
        });

        // this is a bit toffee, but we don't have .parents() in bonzo
        const parentCommentEl = $replyToComment.hasClass(
            this.getClass('topLevelComment', true)
        )
            ? $replyToComment[0]
            : $replyToComment.parent().parent()[0];

        const showRepliesElem = qwery(
            this.getClass('showReplies'),
            parentCommentEl
        );

        if (
            showRepliesElem.length > 0 &&
            !bonzo(showRepliesElem).hasClass('u-h')
        ) {
            showRepliesElem[0].click();
        }

        commentBox.render(parentCommentEl);

        commentBox.on('post:success', (comment) => {
            let responses = qwery('.d-thread--responses', parentCommentEl)[0];

            if (!responses) {
                responses = bonzo.create(
                    '<ul class="d-thread d-thread--responses"></ul>'
                )[0];
                bonzo(parentCommentEl).append(responses);
            }

            commentBox.destroy();
            this.addComment(comment, responses);
        });
    }

    // eslint-disable-next-line class-methods-use-this
    reportComment(e) {
        e.preventDefault();

        const currentTarget = (e.currentTarget);
        const commentId = currentTarget.getAttribute('data-comment-id');
        const submitHandler = (form) => {
            form.removeAttribute('hidden');

            bean.one(form, 'submit', (submitEvent) => {
                submitEvent.preventDefault();
                const category = (form.querySelector(
                    '[name="category"]'
                ));
                const comment = (form.querySelector(
                    '[name="comment"]'
                ));
                const reportCommentSuccess = (formEL) => {
                    formEL.setAttribute('hidden', '');
                };
                const reportCommentFailure = () => {
                    const commentClose = document.querySelector(
                        '.d-report-comment__close'
                    );
                    const commentError = document.querySelector(
                        '.js-discussion__report-comment-error'
                    );

                    if (commentError) {
                        commentError.removeAttribute('hidden');
                    }

                    if (commentClose) {
                        commentClose.classList.add(
                            'd-report-comment__close--error'
                        );
                    }
                };

                if (commentId && category.value !== '0') {
                    const email = (form.querySelector(
                        '[name="email"]'
                    ));

                    reportComment(commentId, {
                        emailAddress: email.value,
                        categoryId: category.value,
                        reason: comment.value,
                    })
                        .then(() => reportCommentSuccess(form))
                        .catch(() => reportCommentFailure());
                }
            });
        };

        if (commentId) {
            const reportContainer = document.querySelector(
                `#comment-${commentId} .js-report-comment-container`
            );

            $('.js-report-comment-form')
                .first()
                .each(submitHandler)
                .appendTo(reportContainer);
        }
    }

    addUser(user) {
        this.user = user;

        // Determine user staff status
        if (this.user && this.user.badge) {

            this.user.isStaff = this.user.badge.some(e => e.name === 'Staff');
        }

        if (!this.isReadOnly()) {
            if (this.user && this.user.privateFields.canPostComment) {
                // remove sign-in link
                $(this.getClass('commentReply')).attr('href', '#');

                this.on('click', this.getClass('commentReply'), event =>
                    this.replyToComment(event)
                );

                this.on('click', this.getClass('commentPick'), event =>
                    this.handlePickClick(event)
                );
            }
        }

        mediator.on('user:username:updated', newUsername => {
            if (this.user) {
                this.user.displayName = newUsername;
            }
        });
    }

    // eslint-disable-next-line class-methods-use-this
    relativeDates() {
        if (shouldMakeTimestampsRelative()) {
            initRelativeDates();
        }
    }

    isAllPageSizeActive() {
        return !!(
            config.get('switches.discussionAllPageSize') &&
            (this.options && this.options.pagesize === 'All') &&
            !this.wholeDiscussionErrors
        );
    }

    // Similar to above, but tells the loader that the fallback size should be used.
    shouldShowPageSizeMessage() {
        return !!(
            config.get('switches.discussionAllPageSize') &&
            (this.options && this.options.pagesize === 'All') &&
            this.wholeDiscussionErrors
        );
    }

    renderComments(resp) {
        const contentEl = bonzo.create(resp.commentsHtml);
        const comments = qwery(this.getClass('comment'), contentEl);

        bonzo(this.elem)
            .empty()
            .append(contentEl);
        this.addMoreRepliesButtons(comments);
        this.postedCommentEl = resp.postedCommentHtml;

        if (shouldMakeTimestampsRelative()) {
            this.relativeDates();
        }

        this.emit('rendered', resp.paginationHtml);
        mediator.emit('modules:comments:renderComments:rendered');
    }
}

export { Comments };
