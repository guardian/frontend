// @flow

import bean from 'bean';
import bonzo from 'bonzo';
import qwery from 'qwery';
import $ from 'lib/$';
import raven from 'lib/raven';
import config from 'lib/config';
import { isBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';
import { scrollToElement } from 'lib/scroller';
import fastdom from 'lib/fastdom-promise';
import fetchJson from 'lib/fetch-json';
import DiscussionAnalytics from 'common/modules/analytics/discussion';
import register from 'common/modules/analytics/register';
import { Component } from 'common/modules/component';
import DiscussionApi from 'common/modules/discussion/api';
import { CommentBox } from 'common/modules/discussion/comment-box';
import { Comments } from 'common/modules/discussion/comments';
import discussionFrontend from 'common/modules/discussion/discussion-frontend';
import {
    handle as upvoteHandle,
    closeTooltip as upvoteCloseTooltip,
} from 'common/modules/discussion/upvote';
import Id from 'common/modules/identity/api';
import userPrefs from 'common/modules/user-prefs';

class Loader extends Component {
    constructor(): void {
        super();

        this.classes = {};
        this.componentClass = 'discussion';
        this.comments = null;
        this.user = null;
        this.username = null;

        register.begin('discussion');
    }

    getUser(): void {
        if (Id.getUserFromCookie()) {
            DiscussionApi.getUser().then(resp => {
                this.user = resp.userProfile;

                Id.getUserFromApi(user => {
                    if (user && user.publicFields.username) {
                        this.username = user.publicFields.username;
                    }

                    this.emit('user:loaded');
                });
            });
        } else {
            this.emit('user:loaded');
        }
    }

    getDiscussionId(): ?string {
        return this.elem && this.elem.getAttribute('data-discussion-key');
    }

    getDiscussionClosed(): boolean {
        return (
            (this.elem &&
                this.elem.getAttribute('data-discussion-closed') === 'true') ||
            false
        );
    }

    // eslint-disable-next-line class-methods-use-this
    getCommentIdFromHash(): ?number {
        const reg = /#comment-(\d+)/;
        return reg.exec(window.location.hash)
            ? parseInt(reg.exec(window.location.hash)[1], 10)
            : null;
    }

    // eslint-disable-next-line class-methods-use-this
    setCommentHash(id: string): void {
        window.location.replace(`#comment-${id}`);
    }

    $topCommentsContainer: bonzo;
    comments: Comments;
    topCommentCount: number;
    user: ?Object;
    username: ?string;

    commentPosted(comment: Object): void {
        this.removeState('truncated');
        this.comments.addComment(comment);
    }

    initState(): void {
        if (this.getDiscussionClosed()) {
            this.setState('closed');
        } else if (this.comments.isReadOnly()) {
            this.setState('readonly');
        } else if (Id.getUserFromCookie()) {
            if (
                this.user &&
                this.user.privateFields &&
                !this.user.privateFields.canPostComment
            ) {
                this.setState('banned');
            } else {
                this.setState('open');
            }
        } else {
            this.setState('open');
        }
    }

    isCommentable(): boolean {
        // not readonly, not closed and user is signed in
        const userCanPost =
            this.user &&
            this.user.privateFields &&
            this.user.privateFields.canPostComment;

        return (
            (userCanPost &&
                !this.comments.isReadOnly() &&
                !this.getDiscussionClosed()) ||
            false
        );
    }

    ready(): void {
        this.$topCommentsContainer = $('.js-discussion-top-comments');

        this.initTopComments();
        this.initMainComments();
        this.initToolbar();
        this.renderCommentCount();
        this.initPagination();
        this.initRecommend();

        DiscussionAnalytics.init();

        // More for analytics than anything
        if (window.location.hash === '#comments') {
            mediator.emit('discussion:seen:comments-anchor');
        } else if (this.getCommentIdFromHash()) {
            mediator.emit('discussion:seen:comment-permalink');
        }

        mediator.on('discussion:commentbox:post:success', () =>
            this.removeState('empty')
        );

        mediator.on('module:clickstream:click', clickspec => {
            const shouldRemoveTruncation =
                clickspec &&
                'hash' in clickspec.target &&
                clickspec.target.hash === '#comments';

            if (shouldRemoveTruncation) {
                this.removeTruncation();
            }
        });

        register.end('discussion');
    }

    initRecommend(): void {
        this.on('click', '.js-recommend-comment', (e: Event) => {
            const target: HTMLElement = (e.currentTarget: any);
            upvoteHandle(target, this.elem, this.user);
        });

        this.on('click', '.js-rec-tooltip-close', () => {
            upvoteCloseTooltip();
        });
    }

    initToolbar(): void {
        const $orderLabel = $('.js-comment-order');
        const $threadingLabel = $('.js-comment-threading');

        $threadingLabel.text(this.comments.options.threading);
        $orderLabel.text(this.comments.options.order);

        this.on(
            'click',
            '.js-comment-order-dropdown .popup__action',
            (e: Event) => {
                bean.fire(
                    qwery('.js-comment-order-dropdown [data-toggle]')[0],
                    'click'
                );
                this.comments.options.order = bonzo(e.currentTarget).data(
                    'order'
                );
                $orderLabel.text(this.comments.options.order);
                userPrefs.set('discussion.order', this.comments.options.order);
                this.loadComments({ page: 1 });
            }
        );

        this.on(
            'click',
            '.js-comment-threading-dropdown .popup__action',
            (e: Event) => {
                bean.fire(
                    qwery('.js-comment-threading-dropdown [data-toggle]')[0],
                    'click'
                );
                this.comments.options.threading = bonzo(e.currentTarget).data(
                    'threading'
                );
                $threadingLabel.text(this.comments.options.threading);
                userPrefs.set(
                    'discussion.threading',
                    this.comments.options.threading
                );
                this.loadComments();
            }
        );

        if (config.page.section === 'crosswords') {
            const $timestampsLabel = $('.js-timestamps');
            const updateLabelText = (prefValue?: boolean) => {
                $timestampsLabel.text(prefValue ? 'Relative' : 'Absolute');
            };

            updateLabelText();

            const PREF_RELATIVE_TIMESTAMPS =
                'discussion.enableRelativeTimestamps';
            // Default to true
            const prefValue =
                userPrefs.get(PREF_RELATIVE_TIMESTAMPS) !== null
                    ? userPrefs.get(PREF_RELATIVE_TIMESTAMPS)
                    : true;

            updateLabelText(prefValue);

            this.on(
                'click',
                '.js-timestamps-dropdown .popup__action',
                (e: Event) => {
                    const format = bonzo(e.currentTarget).data('timestamp');

                    bean.fire(
                        qwery('.js-timestamps-dropdown [data-toggle]')[0],
                        'click'
                    );

                    updateLabelText(format === 'relative');

                    userPrefs.set(
                        PREF_RELATIVE_TIMESTAMPS,
                        format === 'relative'
                    );

                    this.loadComments();
                }
            );
        }
    }

    initPageSizeDropdown(pageSize: number | string): void {
        const $pagesizeLabel = $('.js-comment-pagesize');

        $pagesizeLabel.text(pageSize);

        this.on(
            'click',
            '.js-comment-pagesize-dropdown .popup__action',
            (e: Event) => {
                const selectedPageSize = bonzo(e.currentTarget).data(
                    'pagesize'
                );

                bean.fire(
                    qwery('.js-comment-pagesize-dropdown [data-toggle]')[0],
                    'click'
                );

                this.comments.options.pagesize = selectedPageSize;
                $pagesizeLabel.text(selectedPageSize);
                userPrefs.set('discussion.pagesize', selectedPageSize);
                this.loadComments({ page: 1 });
            }
        );
    }

    initMainComments(): void {
        const commentId = this.getCommentIdFromHash();
        const order =
            userPrefs.get('discussion.order') ||
            (this.getDiscussionClosed() ? 'oldest' : 'newest');
        const threading = userPrefs.get('discussion.threading') || 'collapsed';

        const defaultPagesize = isBreakpoint({ min: 'tablet' }) ? 25 : 10;

        this.comments = new Comments({
            discussionId: this.getDiscussionId(),
            order,
            pagesize: defaultPagesize,
            threading,
        });

        this.comments.attachTo(qwery('.js-discussion-main-comments')[0]);

        this.comments.on('untruncate-thread', () => this.removeTruncation());

        this.on('click,', '.js-discussion-author-link', () =>
            this.removeTruncation()
        );

        this.on(
            'click',
            '.js-discussion-change-page, .js-discussion-show-button',
            () => {
                mediator.emit('discussion:comments:get-more-replies');
                this.removeTruncation();
            }
        );

        this.comments.on('rendered', (paginationHtml: string) => {
            const newPagination = bonzo.create(paginationHtml);
            const toolbarEl = qwery('.js-discussion-toolbar', this.elem)[0];
            const container = $('.js-discussion-pagination', toolbarEl).empty();

            // When the pagesize is 'All', do not show any pagination.
            if (!this.comments.isAllPageSizeActive()) {
                container.html(newPagination);
            }
        });

        this.setState('loading');

        this.on('user:loaded', () => {
            this.initState();
            this.renderCommentBar();

            if (this.user) {
                this.comments.addUser(this.user);

                const userPageSize = userPrefs.get('discussion.pagesize');
                let pageSize = defaultPagesize;

                if (typeof userPageSize === 'number') {
                    pageSize = userPageSize;
                } else if (userPageSize === 'All') {
                    pageSize = config.switches.discussionAllPageSize
                        ? 'All'
                        : 100;
                }

                this.initPageSizeDropdown(pageSize);

                if (
                    config.switches.discussionPageSize &&
                    isBreakpoint({ min: 'tablet' })
                ) {
                    this.comments.options.pagesize = pageSize;
                }

                if (this.user && this.user.isStaff) {
                    this.removeState('not-staff');
                    this.setState('is-staff');
                }
            }

            // Only truncate the loaded comments on this initial fetch,
            // and when no comment ID or #comments location is present.
            const shouldTruncate =
                !commentId && window.location.hash !== '#comments';

            this.loadComments({
                comment: commentId,
                shouldTruncate,
            }).catch(() => this.logError('Comments'));
        });

        this.getUser();
    }

    initTopComments(): Promise<void> {
        const discussionId = this.getDiscussionId();

        this.on('click', '.js-jump-to-comment', (e: Event) => {
            e.preventDefault();
            const commentId = bonzo(e.currentTarget).data('comment-id');
            this.gotoComment(commentId);
        });

        if (!discussionId) {
            return Promise.resolve();
        }

        return fetchJson(
            `/discussion/top-comments/${discussionId}.json?commentsClosed=${this.getDiscussionClosed().toString()}`,
            {
                mode: 'cors',
            }
        )
            .then(resp => {
                this.$topCommentsContainer.html(resp.html);
                this.topCommentCount = qwery(
                    '.d-top-comment',
                    this.$topCommentsContainer[0]
                ).length;
                if (this.topCommentCount !== 0) {
                    $('.js-discussion-comment-box--bottom').removeClass(
                        'discussion__comment-box--bottom--hidden'
                    );
                    this.setState('has-top-comments');
                }
            })
            .catch(() => this.logError('Top comments'));
    }

    logError(commentType: string, error?: Error): void {
        let reportMsg = `${commentType} failed to load: `;

        if (error && error.message) {
            reportMsg += error.message;
        }

        raven.captureMessage(reportMsg, {
            tags: {
                contentType: 'comments',
                discussionId: this.getDiscussionId(),
            },
        });
    }

    initPagination(): void {
        this.on('click', '.js-discussion-change-page', (e: Event) => {
            const target: HTMLElement = (e.currentTarget: any);
            const page = parseInt(target.getAttribute('data-page'), 10);

            e.preventDefault();

            this.setState('loading');
            this.gotoPage(page);
        });
    }

    gotoComment(id: string, fromRequest?: boolean): void {
        const comment = $(`#comment-${id}`, this.elem);

        if (comment.length > 0) {
            const commentsAreHidden =
                $('.js-discussion-main-comments').css('display') === 'none';
            // If comments are hidden, lets show them
            if (commentsAreHidden) {
                fastdom
                    .write(() => {
                        this.comments.showHiddenComments();
                        this.removeState('truncated');

                        $('.d-discussion__show-all-comments').addClass('u-h');
                    })
                    .then(() => {
                        this.setCommentHash(id);
                    });
            } else {
                // If comments aren't hidden we can go straight to the comment
                this.setCommentHash(id);
            }
        } else if (!fromRequest) {
            // If the comment isn't on the page, then we need to load the comment thread
            this.loadComments({ comment: id });
        } else {
            // The comment didn't exist in the response

            // Scroll to toolbar and show message
            scrollToElement(qwery('.js-discussion-toolbar'), 100);

            fastdom.write(() => {
                $('.js-discussion-main-comments').prepend(
                    '<div class="d-discussion__message d-discussion__message--error">The comment you requested could not be found.</div>'
                );
            });

            // Capture in sentry
            raven.captureMessage("Comment doesn't exist in response", {
                level: 'error',
                extra: {
                    commentId: id,
                },
            });
        }
    }

    gotoPage(page: number): void {
        scrollToElement(qwery('.js-discussion-toolbar'), 100);
        this.comments.relativeDates();
        this.loadComments({ page });
    }

    loadComments(
        options?: {
            comment?: ?(string | number),
            shouldTruncate?: boolean,
            page?: number,
        } = {}
    ): Promise<void> {
        const opts = Object.assign({}, options);

        this.setState('loading');

        // If the caller specified truncation, do not load all comments.
        if (opts.shouldTruncate && this.comments.isAllPageSizeActive()) {
            opts.pageSize = 10;
        }

        // Closed state of comments is passed so we bust cache of comment thread when it is reopened
        opts.commentsClosed = this.getDiscussionClosed();

        return this.comments.fetchComments(opts).then(() => {
            this.removeState('loading');

            if (opts.shouldTruncate) {
                this.setState('truncated');
            } else {
                // do not call removeTruncation because it could invoke another fetch.
                this.removeState('truncated');
            }

            if (this.comments.shouldShowPageSizeMessage()) {
                this.setState('pagesize-msg-show');
            } else {
                this.removeState('pagesize-msg-show');
            }

            if (opts.comment) {
                this.gotoComment(opts.comment.toString(), true);
            }
        });
    }

    removeTruncation(): void {
        // When the pagesize is 'All', the full page is not yet loaded, so load the comments.
        if (this.comments.isAllPageSizeActive()) {
            this.loadComments();
        } else {
            this.removeState('truncated');
        }
    }

    renderCommentBox(elem: HTMLElement): void {
        new CommentBox({
            discussionId: this.getDiscussionId(),
            premod:
                this.user &&
                this.user.privateFields &&
                this.user.privateFields.isPremoderated,
            newCommenter:
                this.user &&
                this.user.privateFields &&
                !this.user.privateFields.hasCommented,
            hasUsername: this.username !== null,
            shouldRenderMainAvatar: false,
        })
            .render(elem)
            .on('post:success', comment => this.commentPosted(comment));
    }

    renderCommentBar(): void {
        if (this.isCommentable()) {
            this.renderCommentBox(qwery('.js-discussion-comment-box--top')[0]);
            this.renderCommentBox(
                qwery('.js-discussion-comment-box--bottom')[0]
            );
        }
    }

    renderCommentCount(): void {
        discussionFrontend.load(this, {
            apiHost: config.page.discussionApiUrl,
            avatarImagesHost: config.page.avatarImagesUrl,
            closed: this.getDiscussionClosed(),
            discussionId: this.getDiscussionId(),
            element: document.getElementsByClassName(
                'js-discussion-external-frontend'
            )[0],
            userFromCookie: !!Id.getUserFromCookie(),
            profileUrl: config.page.idUrl,
            profileClientId: config.switches.registerWithPhone
                ? 'comments'
                : '',
            Promise,
        });
    }
}

export { Loader };
