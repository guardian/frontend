import bean from 'bean';
import bonzo from 'bonzo';
import config from 'lib/config';
import { mediator } from 'lib/mediator';
import { Component } from 'common/modules/component';
import {
    getUser,
    postComment,
    previewComment,
} from 'common/modules/discussion/api';
import {
    getUserFromCookie,
    reset,
    updateUsername,
    getUserFromApi,
} from 'common/modules/identity/api';
import { avatarify } from 'common/modules/discussion/user-avatars';
import { init as initValidationEmail } from 'common/modules/identity/validation-email';
import { urlify } from './urlify';


class CommentBox extends Component {
    static async refreshUsernameHtml() {
        reset();

        const discussionUserResponse = await getUser();

        if (!discussionUserResponse || !discussionUserResponse.userProfile) {
            return;
        }

        const discussionUser =
            discussionUserResponse.userProfile;

        const displayName = discussionUser.displayName;
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

    constructor(options) {
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
            USERNAME_MISSING: `You must <a href="${config.get('page.mmaUrl')}/public-settings">set a username</a> before commenting. (<a href="/help/2020/feb/10/why-am-i-unable-to-post-a-comment">Learn more</a>).`,

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

    onboardingPreviewSuccess(comment, resp) {
        const onboardingPreviewBody = this.getElem('onboarding-preview-body');

        if (onboardingPreviewBody) {
            onboardingPreviewBody.innerHTML = resp.commentBody;
        }
    }

    getDiscussionId() {
        const { discussionId } = this.options;
        let discussionKey =
            this.elem &&
            this.elem instanceof HTMLElement &&
            this.elem.getAttribute('data-discussion-key');

        if (!discussionId && discussionKey) {
            discussionKey = discussionKey.replace('discussion', '');
        }

        return discussionId || discussionKey || '';
    }

    setFormState(disabled = false) {
        const commentBody = ((this.getElem('body')));
        const submitButton = this.getElem('submit');

        if (submitButton && (disabled || commentBody.value.length === 0)) {
            submitButton.setAttribute('disabled', 'disabled');
        } else if (submitButton) {
            submitButton.removeAttribute('disabled');
        }
    }

    setExpanded() {
        this.setState('expanded');
    }

    // eslint-disable-next-line class-methods-use-this
    getUserData() {
        // User will always exists at this point.

        return getUserFromCookie();
    }



    clearErrors() {
        const messages = this.getElem('messages');

        if (messages) {
            messages.innerHTML = '';
        }

        this.errors = [];
        this.removeState('invalid');
    }

    previewCommentSuccess(comment, resp) {
        const previewBody = this.getElem('preview-body');

        if (previewBody) {
            previewBody.innerHTML = resp.commentBody;
        }

        this.setState('preview-visible');
    }

    fail(xhr) {
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

    postCommentSuccess(comment, resp) {
        CommentBox.refreshUsernameHtml();

        if (this.options.newCommenter) {
            this.options.newCommenter = false;
        }

        const body = ((this.getElem('body')));

        comment.id = parseInt(resp.message, 10);
        body.value = '';
        this.resetPreviewComment();
        this.setFormState();

        this.emit('post:success', comment);
        mediator.emit('discussion:commentbox:post:success', comment);

        return comment;
    }

    error(type, message) {
        const messages = this.getElem('messages');

        this.setState('invalid');

        const errorMessage = `
            <div class="d-discussion__error ${this.getClass('error', true)}">
                <i class="i i-alert"></i>
                <span class="d-discussion__error-text">
                    ${message || this.errorMessages[type]}
                </span>
            </div>`;

        if (messages) {
            messages.appendChild(bonzo.create(errorMessage)[0]);
        }

        this.errors.push(type);
    }

    postComment() {
        const commentBody = this.getElem('body');
        const { value } =
            (commentBody &&
                commentBody instanceof HTMLTextAreaElement &&
                commentBody) ||
            {};

        const comment = {
            body: value,
        };

        this.clearErrors();

        const postCommentToDAPI = () => {
            this.removeState('onboarding-visible');
            comment.body = urlify(comment.body);
            this.setFormState(true);

            return postComment(this.getDiscussionId(), comment)
                .then((resp) => this.postCommentSuccess(comment, resp))
                .catch((err) => this.fail(err));
        };

        const updateUsernameSuccess = (resp) => {
            const onbordingUsername = this.getElem('onboarding-username');

            mediator.emit(
                'user:username:updated',
                resp.user.publicFields.username
            );

            this.options.hasUsername = true;

            if (onbordingUsername) {
                onbordingUsername.classList.add('is-hidden');
            }

            postCommentToDAPI();
        };

        const updateUsernameFailure = (errorResponse) => {
            const usernameField = this.getElem('onboarding-username-input');
            const errorMessage = this.getElem(
                'onboarding-username-error-message'
            );

            this.setState('onboarding-visible');

            if (usernameField) {
                usernameField.classList.add(
                    'd-comment-box__onboarding-username-error-border'
                );
            }

            // TODO: this should be wrapped into a try-catch block
            if (errorMessage) {
                errorMessage.innerHTML = JSON.parse(
                    errorResponse.responseText
                ).errors[0].description;

                errorMessage.classList.remove('is-hidden');
            }
        };

        const validEmailCommentSubmission = () => {
            if (comment.body === '') {
                this.error('EMPTY_COMMENT_BODY');
            }

            if (comment.body.length > this.options.maxLength) {
                this.error(
                    'COMMENT_TOO_LONG',
                    `<b>Comments must be shorter than ${this.options.maxLength
                    } characters.</b>` +
                    `Yours is currently ${comment.body.length -
                    this.options.maxLength} character(s) too long.`
                );
            }

            if (this.options.replyTo) {
                comment.replyTo = this.options.replyTo;
            }

            if (this.errors.length === 0) {
                if (this.options.newCommenter && !this.options.hasUsername) {
                    const userNameInput = ((this.getElem(
                        'onboarding-username-input'
                    )));
                    return updateUsername(userNameInput.value).then(
                        updateUsernameSuccess,
                        updateUsernameFailure
                    );
                }
                return postCommentToDAPI();
            }

            return Promise.resolve();
        };

        if (!this.getUserData().emailVerified) {
            // Cookie could be stale so lets check from the api
            const createdDate = new Date(this.getUserData().accountCreatedDate);

            if (createdDate > this.options.priorToVerificationDate) {
                return getUserFromApi().then(response => {
                    if (
                        response.user.statusFields.userEmailValidated === true
                    ) {
                        return validEmailCommentSubmission();
                    }
                    this.invalidEmailError();
                });
            }
            return validEmailCommentSubmission();
        }
        return validEmailCommentSubmission();
    }

    invalidEmailError() {
        this.removeState('onboarding-visible');
        this.error('EMAIL_NOT_VALIDATED');
        initValidationEmail();
    }

    submitPostComment(e) {
        e.preventDefault();
        this.postComment();
    }

    ready() {
        if (this.getDiscussionId() === null) {
            throw new Error(
                'CommentBox: You need to set the "data-discussion-key" on your element'
            );
        }

        const commentBody = this.getElem('body');

        this.setFormState();

        if (this.options.newCommenter) {
            bean.on(document.body, 'submit', [this.elem], (event) =>
                this.showOnboarding(event)
            );
            bean.on(
                document.body,
                'click',
                this.getClass('onboarding-cancel'),
                (event) => this.hideOnboarding(event)
            );
        } else {
            bean.on(document.body, 'submit', [this.elem], (event) =>
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
            this.previewComment('previewCommentSuccess')
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

        if (this.options.state) {
            this.setState(this.options.state);
        }

        if (this.options.focus) {
            const body = this.getElem('body');

            if (body) {
                window.setTimeout(() => {
                    body.focus();
                }, 0);
            }
        }
    }

    hideOnboarding(e) {
        e.preventDefault();
        this.removeState('onboarding-visible');
    }

    showOnboarding(e) {
        e.preventDefault();

        // Check if new commenter as they may have already commented on this article
        if (this.hasState('onboarding-visible') || !this.options.newCommenter) {
            if (this.options.hasUsername) {
                this.removeState('onboarding-visible');
            }

            this.postComment();
        } else {
            const onboardingAuthor = this.getElem('onboarding-author');
            const onboardingUsername = this.getElem('onboarding-username');

            if (onboardingAuthor) {
                onboardingAuthor.innerHTML = this.getUserData().displayName;
            }

            this.setState('onboarding-visible');
            this.previewComment('onboardingPreviewSuccess');

            if (onboardingUsername && this.options.hasUsername) {
                onboardingUsername.classList.add('is-hidden');
            }
        }
    }

    prerender() {
        if (!this.options.premod) {
            const premod = this.getElem('premod');

            if (premod && premod.parentNode) {
                premod.parentNode.removeChild(premod);
            }
        }

        const userData = this.getUserData();

        if (this.options.state === 'response') {
            const submit = this.getElem('submit');

            if (submit) {
                submit.innerHTML = 'Post reply';
            }
        } else if (this.options.shouldRenderMainAvatar) {
            const avatarWrapper = this.getElem('avatar-wrapper');

            if (avatarWrapper) {
                avatarWrapper.setAttribute('userid', userData.id);
                avatarWrapper.setAttribute('data-userid', userData.id);
                avatarify(avatarWrapper);
            }
        } else {
            const container = document.getElementsByClassName(
                'd-comment-box__meta'
            )[0];

            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }

        if (this.options.replyTo) {
            const replyToAuthor = this.getElem('reply-to-author');
            const parentCommentBody = this.getElem('parent-comment-body');
            const parentCommentAuthor = this.getElem('parent-comment-author');
            const { author, timestamp, body } = this.options.replyTo || {};

            if (replyToAuthor && author) {
                replyToAuthor.innerHTML = author;
            }

            if (parentCommentAuthor && author && timestamp) {
                parentCommentAuthor.innerHTML = `${author} @ ${timestamp} said:`;
            }

            if (parentCommentBody && body) {
                parentCommentBody.innerHTML = body;
            }

            const setSpoutMargin = () => {
                const parentCommentSpout = this.getElem('parent-comment-spout');
                const spoutOffset = replyToAuthor
                    ? replyToAuthor.offsetLeft +
                    replyToAuthor.getBoundingClientRect().width / 2
                    : false;

                if (parentCommentSpout && spoutOffset) {
                    parentCommentSpout.style.marginLeft = `${spoutOffset}px`;
                }
            };

            window.setTimeout(() => setSpoutMargin(), 0);
        }
    }

    verificationEmailSuccess() {
        this.clearErrors();
        this.error('EMAIL_VERIFIED');
    }

    verificationEmailFail() {
        this.clearErrors();
        this.error('EMAIL_VERIFIED_FAIL');
    }

    previewComment(methodName) {
        const body = ((this.getElem('body')));
        const comment = {
            body: body.value,
        };

        const callback = this[methodName].bind(this);

        this.clearErrors();

        if (comment.body === '') {
            this.resetPreviewComment();
            this.error('EMPTY_COMMENT_BODY');
        }

        if (
            comment &&
            comment.body &&
            comment.body.length > this.options.maxLength
        ) {
            const charDiff = comment.body.length - this.options.maxLength;
            const errorMessage = `
                <b>Comments must be shorter than
                ${this.options.maxLength} characters</b>. Yours is currently
                ${charDiff} characters too long.`;

            this.error('COMMENT_TOO_LONG', errorMessage);
        }

        if (this.errors.length === 0) {
            previewComment(comment)
                .then((resp) => callback(comment, resp))
                .catch((err) => this.fail(err));
        }
    }

    cancelComment() {
        if (this.options.state === 'response') {
            this.destroy();
        } else {
            const body = ((this.getElem('body')));

            this.resetPreviewComment();
            body.value = '';
            this.setFormState();
            this.removeState('expanded');
        }
    }

    resetPreviewComment() {
        const previewBody = this.getElem('preview-body');

        this.removeState('preview-visible');

        if (previewBody) {
            previewBody.innerHTML = '';
        }
    }

    formatComment(formatStyle) {
        const commentBody = ((this.getElem('body')));
        const cursorPositionStart = commentBody.selectionStart;
        let selectedText = commentBody.value.substring(
            commentBody.selectionStart,
            commentBody.selectionEnd
        );

        const selectNewText = (newText) => {
            commentBody.setSelectionRange(
                cursorPositionStart,
                cursorPositionStart + newText.length
            );
        };

        const formatSelection = (startTag, endTag) => {
            const newText = startTag + selectedText + endTag;

            commentBody.value =
                commentBody.value.substring(0, commentBody.selectionStart) +
                newText +
                commentBody.value.substring(commentBody.selectionEnd);

            selectNewText(newText);
        };

        const formatSelectionLink = () => {
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
