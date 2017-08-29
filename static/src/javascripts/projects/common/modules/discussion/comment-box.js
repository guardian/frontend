// @flow

import bean from 'bean';
import bonzo from 'bonzo';
import mediator from 'lib/mediator';
import { Component } from 'common/modules/component';
import DiscussionApi from 'common/modules/discussion/api';
import IdentityApi from 'common/modules/identity/api';
import UserAvatars from 'common/modules/discussion/user-avatars';
import ValidationEmail from 'common/modules/identity/validation-email';
import { urlify } from './urlify';

type commentType = {
    body: string,
    id?: number,
    replyTo?: Object,
};

class CommentBox extends Component {
    constructor(options: Object): void {
        super();

        this.useBem = true;
        this.templateName = 'comment-box';
        this.componentClass = 'd-comment-box';
        this.classes = {};
        this.errors = [];
        this.defaultOptions = {
            discussionId: null,
            apiRoot: null,
            maxLength: 5000,
            premod: false,
            newCommenter: false,
            hasUsername: true,
            focus: false,
            state: 'top-level',
            replyTo: null,
            priorToVerificationDate: new Date(1392719401337), // Tue Feb 18 2014 10:30:01 GMT
        };
        this.errorMessages = {
            EMPTY_COMMENT_BODY: 'Please write a comment.',
            COMMENT_TOO_LONG:
                'Your comment must be fewer than 5000 characters long.',
            USER_BANNED:
                'Commenting has been disabled for this account (<a href="/community-faqs#321a">why?</a>).',
            IP_THROTTLED:
                'Commenting has been temporarily blocked for this IP address (<a href="/community-faqs">why?</a>).',
            DISCUSSION_CLOSED:
                'Sorry your comment can not be published as the discussion is now closed for comments.',
            PARENT_COMMENT_MODERATED:
                'Sorry the comment can not be published as the comment you replied to has been moderated since.',
            COMMENT_RATE_LIMIT_EXCEEDED:
                'You can only post one comment every minute. Please try again in a moment.',
            INVALID_PROTOCOL:
                'Sorry your comment can not be published as it was not sent over a secure channel. Please report us this issue using the technical issue link in the page footer.',
            AUTH_COOKIE_INVALID:
                'Sorry, your comment was not published as you are no longer signed in. Please sign in and try again.',
            'READ-ONLY-MODE':
                'Sorry your comment can not currently be published as commenting is undergoing maintenance but will be back shortly. Please try again in a moment.',

            /* Custom error codes */
            /* CORS blocked by HTTP/1.0 proxy */

            API_CORS_BLOCKED: `Could not post due to your internet settings, which might be
                 controlled by your provider. Please contact your administrator
                 or disable any proxy servers or VPNs and try again.`,
            API_ERROR: `Sorry, there was a problem posting your comment. Please try
                another browser or network connection.  Reference code `,
            EMAIL_VERIFIED: `<span class="d-comment-box__error-meta">Sent. Please check your
                email to verify your email address. Once verified post your
                comment.</span>`,
            EMAIL_VERIFIED_FAIL: `We are having technical difficulties. Please try again later or
                <a href="/send/email" class="js-id-send-validation-email">
                <strong>resend the verification</strong></a>.`,
            EMAIL_NOT_VALIDATED: `Please confirm your email address to comment.<br />
                If you can't find the email, we can
                <a href="_#" class="js-id-send-validation-email">
                <strong>resend the verification email</strong></a> to your email
                address.`,
        };

        this.setOptions(options);

        mediator.on('module:identity:validation-email:success', () =>
            this.verificationEmailSuccess()
        );

        mediator.on('module:identity:validation-email:fail', () =>
            this.verificationEmailFail()
        );
    }

    onboardingPreviewSuccess(comment: commentType, resp: Object): void {
        this.getElem('onboarding-preview-body').innerHTML = resp.commentBody;
    }

    getDiscussionId(): string {
        const discussionKey =
            (this.elem && this.elem.getAttribute('data-discussion-key')) || '';

        return (
            (this.options && this.options.discussionId) ||
            discussionKey.replace('discussion', '')
        );
    }

    setFormState(disabled?: boolean = false): void {
        const commentBody: HTMLInputElement = (this.getElem('body'): any);
        const submitButton = this.getElem('submit');

        if (disabled || commentBody.value.length === 0) {
            submitButton.setAttribute('disabled', 'disabled');
        } else {
            submitButton.removeAttribute('disabled');
        }
    }

    setExpanded(): void {
        this.setState('expanded');
    }

    // eslint-disable-next-line class-methods-use-this
    getUserData(): Object {
        return IdentityApi.getUserFromCookie();
    }

    errorMessages: Object;
    errors: Array<string>;

    clearErrors(): void {
        this.getElem('messages').innerHTML = '';
        this.errors = [];
        this.removeState('invalid');
    }

    refreshUsernameHtml(): void {
        IdentityApi.reset();

        const displayName = this.getUserData().displayName;
        const menuHeaderUsername = document.querySelector('.js-profile-info');
        const discussionHeaderUsername = document.querySelector(
            '._author_tywwu_16'
        );

        if (menuHeaderUsername && displayName) {
            menuHeaderUsername.innerHTML = displayName;
        }

        if (discussionHeaderUsername && displayName) {
            discussionHeaderUsername.innerHTML = displayName;
        }
    }

    previewCommentSuccess(comment: commentType, resp: Object): void {
        this.getElem('preview-body').innerHTML = resp.commentBody;
        this.setState('preview-visible');
    }

    fail(xhr: Object): void {
        let response;

        // if our API is down, it returns HTML
        // this is not so good for JSON.parse
        try {
            response = JSON.parse(xhr.responseText);
        } catch (e) {
            response = {};
        }

        this.setFormState();

        if (xhr.status === 0) {
            this.error('API_CORS_BLOCKED');
        } else if (response.errorCode === 'EMAIL_NOT_VALIDATED') {
            this.invalidEmailError();
        } else if (response.errorCode === 'IP_ADDRESS_BLOCKED') {
            this.error('IP_THROTTLED');
        } else if (this.errorMessages[response.errorCode]) {
            this.error(response.errorCode);
        } else {
            this.error('API_ERROR', this.errorMessages.API_ERROR + xhr.status); // templating would be ideal here
        }
    }

    postCommentSuccess(comment: commentType, resp: Object): void {
        if (this.options && this.options.newCommenter) {
            this.refreshUsernameHtml();

            if (this.options) {
                this.options.newCommenter = false;
            }
        }

        const commentBody: HTMLInputElement = (this.getElem('body'): any);

        comment.id = parseInt(resp.message, 10);
        commentBody.value = '';
        this.resetPreviewComment();
        this.setFormState();

        this.emit('post:success', comment);
        mediator.emit('discussion:commentbox:post:success', comment);
    }

    error(type: string, message?: string): void {
        this.setState('invalid');

        const errorMessage = `
            <div class="d-discussion__error ${this.getClass('error', true)}">
                <i class="i i-alert"></i>
                <span class="d-discussion__error-text">
                    ${message || this.errorMessages[type]}
                </span>
            </div>`;
        this.getElem('messages').appendChild(bonzo.create(errorMessage)[0]);
        this.errors.push(type);
    }

    postComment(): void {
        const commentBody = this.elem && this.elem.body;
        const body: string = (commentBody && commentBody.value: any) || '';
        const comment: commentType = { body };

        this.clearErrors();

        const postCommentToDAPI = (): void => {
            this.removeState('onboarding-visible');
            comment.body = urlify(comment.body);
            this.setFormState(true);
            DiscussionApi.postComment(this.getDiscussionId(), comment)
                .then((resp: Object) => this.postCommentSuccess(comment, resp))
                .catch((err: Object) => this.fail(err));
        };

        const updateUsernameSuccess = (resp: Object): void => {
            mediator.emit(
                'user:username:updated',
                resp.user.publicFields.username
            );

            if (this.options) {
                this.options.hasUsername = true;
            }

            this.getElem('onboarding-username').classList.add('is-hidden');
            postCommentToDAPI();
        };

        const updateUsernameFailure = (errorResponse: Object): void => {
            const usernameField = this.getElem('onboarding-username-input');
            const errorMessage = this.getElem(
                'onboarding-username-error-message'
            );

            this.setState('onboarding-visible');

            usernameField.classList.add(
                'd-comment-box__onboarding-username-error-border'
            );

            // TODO: this should be wrapped into a try-catch block
            errorMessage.innerHTML = JSON.parse(
                errorResponse.responseText
            ).errors[0].description;
            errorMessage.classList.remove('is-hidden');
        };

        const validEmailCommentSubmission = (): void => {
            if (comment.body === '') {
                this.error('EMPTY_COMMENT_BODY');
            }

            if (this.options && comment.body.length > this.options.maxLength) {
                const maxLength = this.options.maxLength || 0;
                const diff = comment.body.length - maxLength;

                this.error(
                    'COMMENT_TOO_LONG',
                    `<b>Comments must be shorter than ${maxLength} characters.</b>
                    Yours is currently ${diff} character(s) too long.`
                );
            }

            if (this.options && this.options.replyTo) {
                comment.replyTo = this.options.replyTo;
            }

            if (this.errors.length === 0) {
                if (
                    this.options &&
                    this.options.newCommenter &&
                    !this.options.hasUsername
                ) {
                    const onboardingInp: HTMLInputElement = (this.getElem(
                        'onboarding-username-input'
                    ): any);

                    IdentityApi.updateUsername(onboardingInp.value).then(
                        updateUsernameSuccess,
                        updateUsernameFailure
                    );
                } else {
                    postCommentToDAPI();
                }
            }
        };

        if (!this.getUserData().emailVerified) {
            // Cookie could be stale so lets refresh and check from the api
            const createdDate = new Date(this.getUserData().accountCreatedDate);

            if (
                this.options &&
                createdDate > this.options.priorToVerificationDate
            ) {
                IdentityApi.getUserFromApiWithRefreshedCookie().then(
                    response => {
                        if (
                            response.user.statusFields.userEmailValidated ===
                            true
                        ) {
                            validEmailCommentSubmission();
                        } else {
                            this.invalidEmailError();
                        }
                    }
                );
            } else {
                validEmailCommentSubmission();
            }
        } else {
            validEmailCommentSubmission();
        }
    }

    invalidEmailError(): void {
        this.removeState('onboarding-visible');
        this.error('EMAIL_NOT_VALIDATED');
        ValidationEmail.init();
    }

    submitPostComment(e: Event): void {
        e.preventDefault();
        this.postComment();
    }

    ready(): void {
        if (this.getDiscussionId() === null) {
            throw new Error(
                'CommentBox: You need to set the "data-discussion-key" on your element'
            );
        }

        const commentBody = this.getElem('body');

        this.setFormState();

        if (this.options && this.options.newCommenter) {
            bean.on(document.body, 'submit', [this.elem], (event: Event) =>
                this.showOnboarding(event)
            );
            bean.on(
                document.body,
                'click',
                this.getClass('onboarding-cancel'),
                (event: Event) => this.hideOnboarding(event)
            );
        } else {
            bean.on(document.body, 'submit', [this.elem], (event: Event) =>
                this.submitPostComment(event)
            );
        }

        bean.on(document.body, 'change keyup', [commentBody], () =>
            this.setFormState()
        );

        bean.on(commentBody, 'focus', () => this.setExpanded());

        this.on('change', '.d-comment-box__body', () =>
            this.resetPreviewComment()
        );
        this.on('click', this.getClass('preview'), () =>
            this.previewComment(this.previewCommentSuccess)
        );
        this.on('click', this.getClass('hide-preview'), () =>
            this.resetPreviewComment()
        );

        this.on('click', this.getClass('cancel'), () => this.cancelComment());
        this.on('click', this.getClass('show-parent'), () =>
            this.setState('parent-visible')
        );
        this.on('click', this.getClass('hide-parent'), () =>
            this.removeState('parent-visible')
        );

        ['bold', 'italic', 'quote', 'link'].forEach(format => {
            const selector = this.getClass(`formatting-${format}`);

            this.on('click', selector, () => this.formatComment(format));
        });

        if (this.options && this.options.state) {
            this.setState(this.options.state);
        }

        if (this.options && this.options.focus) {
            window.setTimeout(() => {
                this.getElem('body').focus();
            }, 0);
        }
    }

    hideOnboarding(e: Event): void {
        e.preventDefault();
        this.removeState('onboarding-visible');
    }

    showOnboarding(e: Event): void {
        e.preventDefault();

        // Check if new commenter as they may have already commented on this article
        if (
            this.hasState('onboarding-visible') ||
            (this.options && !this.options.newCommenter)
        ) {
            if (this.options && this.options.hasUsername) {
                this.removeState('onboarding-visible');
            }

            this.postComment();
        } else {
            this.getElem(
                'onboarding-author'
            ).innerHTML = this.getUserData().displayName;

            this.setState('onboarding-visible');
            this.previewComment(this.onboardingPreviewSuccess);

            if (this.options && this.options.hasUsername) {
                this.getElem('onboarding-username').classList.add('is-hidden');
            }
        }
    }

    prerender(): void {
        if (this.options && !this.options.premod) {
            const premod = this.getElem('premod');

            if (premod && premod.parentNode) {
                premod.parentNode.removeChild(premod);
            }
        }

        const userData = this.getUserData();

        this.getElem('author').innerHTML = userData.displayName;

        if (this.options && this.options.state === 'response') {
            this.getElem('submit').innerHTML = 'Post reply';
        } else if (this.options && this.options.shouldRenderMainAvatar) {
            const avatar = this.getElem('avatar-wrapper');
            avatar.setAttribute('userid', userData.id);
            avatar.setAttribute('data-userid', userData.id);
            UserAvatars.avatarify(avatar);
        } else {
            const container = document.getElementsByClassName(
                'd-comment-box__meta'
            )[0];

            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }

        if (this.options && this.options.replyTo) {
            const { author, timestamp } = this.options && this.options.replyTo;
            const replyToAuthor = this.getElem('reply-to-author');
            replyToAuthor.innerHTML = author;
            this.getElem(
                'parent-comment-author'
            ).innerHTML = `${author} @ ${timestamp} said:`;

            this.getElem('parent-comment-body').innerHTML =
                (this.options &&
                    this.options.replyTo &&
                    this.options.replyTo.body) ||
                '';

            const setSpoutMargin = () => {
                const spoutOffset =
                    replyToAuthor.offsetLeft +
                    replyToAuthor.getBoundingClientRect().width / 2;
                this.getElem(
                    'parent-comment-spout'
                ).style.marginLeft = `${spoutOffset}px`;
            };

            window.setTimeout(() => setSpoutMargin(), 0);
        }
    }

    verificationEmailSuccess(): void {
        this.clearErrors();
        this.error('EMAIL_VERIFIED');
    }

    verificationEmailFail(): void {
        this.clearErrors();
        this.error('EMAIL_VERIFIED_FAIL');
    }

    previewComment(
        callbackRef: (comment: commentType, resp: Object) => void
    ): void {
        const commentBody = this.getElem('body');
        const comment: commentType = {
            body:
                commentBody instanceof HTMLInputElement
                    ? commentBody.value
                    : '',
        };
        const callback = callbackRef.bind(this);

        this.clearErrors();

        if (comment.body === '') {
            this.resetPreviewComment();
            this.error('EMPTY_COMMENT_BODY');
        }

        if (this.options && comment.body.length > this.options.maxLength) {
            const charDiff =
                comment.body.length -
                ((this.options && this.options.maxLength) || 0);
            const maxLength = (this.options && this.options.maxLength) || '';
            const errorMessage = `
                <b>Comments must be shorter than ${maxLength} characters</b>.
                Yours is currently ${charDiff} characters too long.`;

            this.error('COMMENT_TOO_LONG', errorMessage);
        }

        if (this.errors.length === 0) {
            DiscussionApi.previewComment(comment)
                .then((resp: Object) => callback(comment, resp))
                .catch((err: Object) => this.fail(err));
        }
    }

    cancelComment(): void {
        if (this.options && this.options.state === 'response') {
            this.destroy();
        } else {
            this.resetPreviewComment();

            const commentBody = this.getElem('body');

            if (commentBody instanceof HTMLInputElement) {
                commentBody.value = '';
            }

            this.setFormState();
            this.removeState('expanded');
        }
    }

    resetPreviewComment(): void {
        this.removeState('preview-visible');
        this.getElem('preview-body').innerHTML = '';
    }

    formatComment(formatStyle: string): void {
        const commentBody = this.getElem('body');

        if (!(commentBody instanceof HTMLInputElement)) {
            return;
        }

        const cursorPositionStart = commentBody.selectionStart;
        let selectedText = commentBody.value.substring(
            commentBody.selectionStart,
            commentBody.selectionEnd
        );

        const selectNewText = (newText: string): void => {
            commentBody.setSelectionRange(
                cursorPositionStart,
                cursorPositionStart + newText.length
            );
        };

        const formatSelection = (startTag: string, endTag: string): void => {
            const newText = startTag + selectedText + endTag;

            commentBody.value =
                commentBody.value.substring(0, commentBody.selectionStart) +
                newText +
                commentBody.value.substring(commentBody.selectionEnd);

            selectNewText(newText);
        };

        const formatSelectionLink = (): void => {
            let href;
            let linkURL;

            if (/^https?:\/\//i.test(selectedText)) {
                href = selectedText;
            } else {
                // eslint-disable-next-line no-alert
                linkURL = window.prompt('Your URL:', 'http://www.');
                href = linkURL;

                selectedText = selectedText || linkURL;
            }

            const newText = `<a href="${href}">${selectedText}</a>`;

            commentBody.value =
                commentBody.value.substring(0, commentBody.selectionStart) +
                newText +
                commentBody.value.substring(commentBody.selectionEnd);
        };

        // eslint-disable-next-line default-case
        switch (formatStyle) {
            case 'bold':
                formatSelection('<b>', '</b>');
                break;
            case 'italic':
                formatSelection('<i>', '</i>');
                break;
            case 'quote':
                formatSelection('<blockquote>', '</blockquote>');
                break;
            case 'link':
                formatSelectionLink();
                break;
        }
    }
}

export { CommentBox };
