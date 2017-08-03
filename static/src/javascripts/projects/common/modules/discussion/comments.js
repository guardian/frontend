// @flow

import type { reqwestPromise } from 'lib/ajax';

import bean from 'bean';
import bonzo from 'bonzo';
import qwery from 'qwery';
import $ from 'lib/$';
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import mediator from 'lib/mediator';
import reportError from 'lib/report-error';
import { constructQuery } from 'lib/url';
import Component from 'common/modules/component';
import DiscussionApi from 'common/modules/discussion/api';
import { CommentBox } from 'common/modules/discussion/comment-box';
import WholeDiscussion from 'common/modules/discussion/whole-discussion';
import relativedates from 'common/modules/ui/relativedates';
import userPrefs from 'common/modules/user-prefs';
import { inlineSvg } from 'common/views/svgs';

const PREF_RELATIVE_TIMESTAMPS: string = 'discussion.enableRelativeTimestamps';

const shouldMakeTimestampsRelative = (): boolean =>
    userPrefs.get(PREF_RELATIVE_TIMESTAMPS) !== null
        ? userPrefs.get(PREF_RELATIVE_TIMESTAMPS)
        : true;

class Comments extends Component {
    constructor(options: Object): void {
        super();

        this.comments = null;
        this.topLevelComments = null;
        this.user = null;
        this.componentClass = 'd-comments';
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

    getMoreReplies(event: Event): void {
        event.preventDefault();

        const target: HTMLElement = (event.target: any);
        const currentTarget: HTMLElement = (event.currentTarget: any);

        // #? We have to check what's going on here with #flow and innerHTML
        const li: Element = ($.ancestor(
            currentTarget,
            this.getClass('showReplies').slice(1)
        ): any);

        if (li) {
            li.innerHTML = 'Loading…';
        }

        const source = bonzo(target).data('source-comment');
        const commentId = currentTarget.getAttribute('data-comment-id');

        if (!commentId) {
            return;
        }

        fetchJson(
            `/discussion/comment/${commentId}.json?displayThreaded=true`,
            {
                mode: 'cors',
            }
        )
            .then(resp => {
                const comment = bonzo.create(resp.html);
                let replies = qwery(this.getClass('reply'), comment);

                replies = replies.slice(this.options.showRepliesCount);
                bonzo(qwery('.d-thread--responses', source)).append(replies);
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

    addMoreRepliesButtons(comms: qwery): void {
        const comments = comms || this.topLevelComments;

        if (comments) {
            comments.forEach(elem => {
                const replies = parseInt(
                    elem.getAttribute('data-comment-replies'),
                    10
                );
                const renderedReplies = qwery(this.getClass('reply'), elem);

                if (renderedReplies.length < replies) {
                    const numHiddenReplies = replies - renderedReplies.length;
                    const $btn = $.create(
                        `<button class="u-button-reset button button--show-more button--small button--tone-news d-show-more-replies__button">${inlineSvg(
                            'plus',
                            ['icon']
                        )}Show ${numHiddenReplies} more ${numHiddenReplies === 1
                            ? 'reply'
                            : 'replies'}</button>`
                    )
                        .attr({
                            'data-link-name': 'Show more replies',
                            'data-is-ajax': '',
                            'data-comment-id': elem.getAttribute(
                                'data-comment-id'
                            ),
                        })
                        .data('source-comment', elem);

                    $.create(
                        `<li class="${this.getClass(
                            'showReplies',
                            true
                        )}"></li>`
                    )
                        .append($btn)
                        .appendTo($('.d-thread--responses', elem));
                }
            });
        }
    }

    showHiddenComments(e?: Event): void {
        if (e) {
            e.preventDefault();
        }

        this.emit('first-load');

        $('.js-discussion-main-comments').css('display', 'block');

        if (shouldMakeTimestampsRelative()) {
            this.relativeDates();
        }
    }

    fetchComments(options: Object = {}) {
        const url = `/discussion/${options.comment
            ? `comment-context/${options.comment}`
            : this.options.discussionId}.json`;

        let orderBy = options.order || this.options.order;
        if (orderBy === 'recommendations') {
            orderBy = 'mostRecommended';
        }

        const queryParams = {
            maxResponses: 0,
            orderBy,
            page: undefined,
            pageSize: options.pagesize || this.options.pagesize,
            displayThreaded: this.options.threading !== 'unthreaded',
            commentsClosed: options.commentsClosed,
        };

        if (options.page) {
            queryParams.page = options.page;
        }

        if (!options.comment && this.options.threading === 'collapsed') {
            queryParams.maxResponses = 3;
        }

        let promise;
        const ajaxParams = { mode: 'cors' };

        if (this.isAllPageSizeActive()) {
            promise = new WholeDiscussion({
                discussionId: this.options.discussionId,
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

        return promise.then(this.renderComments.bind(this));
    }

    unPickComment(commentId: string, $thisButton: bonzo): reqwestPromise {
        const comment = qwery(`#comment-${commentId}`);

        return DiscussionApi.unPickComment(commentId).then(() => {
            $(this.getClass('commentPick'), comment).addClass('u-h');
            $thisButton.text('Pick');
            comment.setAttribute('data-comment-highlighted', false);
        });
    }

    pickComment(commentId: string, $thisButton: bonzo): reqwestPromise {
        const comment = qwery(`#comment-${commentId}`, this.elem);

        return DiscussionApi.pickComment(commentId).then(() => {
            $(this.getClass('commentPick'), comment).removeClass('u-h');
            $thisButton.text('Unpick');
            comment.setAttribute('data-comment-highlighted', true);
        });
    }

    handlePickClick(e: Event) {
        e.preventDefault();

        const target: HTMLElement = (e.target: any);
        const commentId = target.getAttribute('data-comment-id');
        const $thisButton = $(target);
        const promise =
            $thisButton[0].getAttribute('data-comment-highlighted') === 'true'
                ? this.unPickComment
                : this.pickComment;

        if (commentId) {
            promise(commentId, $thisButton).fail(resp => {
                const responseText =
                    resp.response.length > 0
                        ? JSON.parse(resp.response).message
                        : resp.statusText;

                $(target).text(responseText);
            });
        }
    }

    comments: ?qwery;
    topLevelComments: ?qwery;

    isReadOnly(): boolean {
        return this.elem.getAttribute('data-read-only') === 'true';
    }

    addComment(comment: { id: string, body: string }, parent?: HTMLElement) {
        const commentElem: bonzo = bonzo.create(this.postedCommentEl)[0];
        const $commentElem: bonzo = bonzo(commentElem);
        const map: Object = {
            username: 'd-comment__author',
            timestamp: 'js-timestamp',
            body: 'd-comment__body',
            report: 'd-comment__action--report',
            avatar: 'd-comment__avatar',
        };
        const values: Object = {
            username: this.user.displayName,
            timestamp: 'Just now',
            body: `<p>${comment.body.replace(/\n+/g, '</p><p>')}</p>`,
            report: {
                href: `http://discussion.theguardian.com/components/report-abuse/${comment.id}`,
            },
            avatar: {
                src: this.user.avatar,
            },
        };

        Object.keys(values).forEach(key => {
            const selector = map.hasOwnProperty(key) && map[key];
            const val = values[key];
            const elem = qwery(`.${selector}`, commentElem)[0];

            if (typeof val === 'string') {
                elem.innerHTML = val;
            } else if (typeof val === 'object') {
                Object.keys(val).forEach(attr => {
                    const prop = val.hasOwnProperty(attr) && val[attr];
                    elem.setAttribute(attr, prop);
                });
            }
        });

        $commentElem.addClass('d-comment--new');
        commentElem.id = `comment-${comment.id}`;

        if (this.user && !this.user.isStaff) {
            $commentElem.addClass(this.getClass('commentStaff', true));
        }

        // Stupid hack. Will rearchitect.
        if (!parent) {
            $(this.getClass('newComments'), this.elem).prepend(commentElem);
        } else {
            $commentElem.removeClass(this.getClass('topLevelComment', true));
            $commentElem.addClass(this.getClass('reply', true));
            bonzo(parent).append($commentElem);
        }

        window.location.replace(`#comment-${comment.id}`);
    }

    replyToComment(e: Event) {
        e.preventDefault(); // stop the anchor link firing

        const replyLink: HTMLElement = (e.currentTarget: any);
        const replyToId = replyLink.getAttribute('data-comment-id') || '';
        const replyToEl = document.getElementById(`reply-to-${replyToId}`);
        let parentCommentEl;

        // There is already a comment box for this on the page
        if (replyToEl) {
            replyToEl.focus();
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
            discussionId: this.options.discussionId,
            premod: this.user.privateFields.isPremoderated,
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

        const showRepliesElem = qwery(
            this.getClass('showReplies'),
            parentCommentEl
        );

        parentCommentEl = $replyToComment.hasClass(
            this.getClass('topLevelComment', true)
        )
            ? $replyToComment[0]
            : $replyToComment.parent().parent()[0];

        if (
            showRepliesElem.length > 0 &&
            !bonzo(showRepliesElem).hasClass('u-h')
        ) {
            showRepliesElem[0].click();
        }

        commentBox.render(parentCommentEl);

        // TODO (jamesgorrie): Remove Hack hack hack
        commentBox.on('post:success', comment => {
            let responses = qwery('.d-thread--responses', parentCommentEl)[0];

            if (!responses) {
                responses = bonzo.create(
                    '<ul class="d-thread d-thread--responses"></ul>'
                )[0];

                bonzo(parentCommentEl).append(responses);
            }

            this.destroy();
            this.addComment(comment, responses);
        });
    }

    reportComment(event: Event): void {
        event.preventDefault();

        const target: HTMLElement = (event.currentTarget: any);
        const commentId = target.getAttribute('data-comment-id');

        if (!commentId) {
            return;
        }

        $('.js-report-comment-form')
            .first()
            .each(form => {
                form.removeAttribute('hidden');

                bean.one(form, 'submit', e => {
                    e.preventDefault();

                    const category = form.elements.category;
                    const comment = form.elements.comment.value;

                    if (category.value !== '0') {
                        DiscussionApi.reportComment(commentId, {
                            emailAddress: form.elements.email.value,
                            categoryId: category.value,
                            reason: comment,
                        }).then(
                            this.reportCommentSuccess.bind(this, form),
                            this.reportCommentFailure.bind(this)
                        );
                    }
                });
            })
            .appendTo(
                $(`#comment-${commentId} .js-report-comment-container`).first()
            );
    }

    // eslint-disable-next-line class-methods-use-this
    reportCommentSuccess(form: HTMLElement): void {
        form.setAttribute('hidden', '');
    }

    // eslint-disable-next-line class-methods-use-this
    reportCommentFailure(): void {
        const commentError = document.querySelector(
            '.js-discussion__report-comment-error'
        );
        const commentClose = document.querySelector('.d-report-comment__close');

        if (commentError) {
            commentError.removeAttribute('hidden');
        }

        if (commentClose) {
            commentClose.classList.add('d-report-comment__close--error');
        }
    }

    addUser(user: Object) {
        this.user = user;

        // Determine user staff status
        if (this.user && this.user.badge) {
            this.user.isStaff = this.user.badge.some(
                e =>
                    // Returns true if any element in array satisfies function
                    e.name === 'Staff'
            );
        }

        if (!this.isReadOnly()) {
            if (this.user && this.user.privateFields.canPostComment) {
                $(this.getClass('commentReply')).attr('href', '#'); // remove sign-in link

                this.on(
                    'click',
                    this.getClass('commentReply'),
                    this.replyToComment
                );

                this.on(
                    'click',
                    this.getClass('commentPick'),
                    this.handlePickClick
                );
            }
        }

        mediator.on('user:username:updated', (newUsername: string) => {
            if (this.user) {
                this.user.displayName = newUsername;
            }
        });
    }

    // eslint-disable-next-line class-methods-use-this
    relativeDates(): void {
        if (shouldMakeTimestampsRelative()) {
            relativedates.init();
        }
    }

    isAllPageSizeActive(): boolean {
        return (
            config.switches.discussionAllPageSize &&
            this.options.pagesize === 'All' &&
            !this.wholeDiscussionErrors
        );
    }

    shouldShowPageSizeMessage(): boolean {
        // Similar to above, but tells the loader that the fallback size should be used.
        return (
            config.switches.discussionAllPageSize &&
            this.options.pagesize === 'All' &&
            this.wholeDiscussionErrors
        );
    }

    renderComments(resp: Object): void {
        // The resp object received has a collection of rendered html fragments, ready for DOM insertion.
        // - commentsHtml - the main comments content.
        // - paginationHtml - the discussion's pagination based on user page size and number of comments.
        // - postedCommentHtml - an empty comment for when the user successfully posts a comment.

        const contentEl = bonzo.create(resp.commentsHtml);
        const comments = qwery(this.getClass('comment'), contentEl);

        bonzo(this.elem).empty().append(contentEl);
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
