define([
    'lib/$',
    'bean',
    'bonzo',
    'lib/config',
    'lib/mediator',
    'common/modules/discussion/api',
    'common/modules/identity/api',
    'common/modules/component',
    'common/modules/discussion/user-avatars',
    'common/modules/identity/validation-email'
], function(
    $,
    bean,
    bonzo,
    config,
    mediator,
    DiscussionApi,
    IdentityApi,
    Component,
    UserAvatars,
    ValidationEmail
) {

/**
 * @constructor
 * @extends Component
 * @param {Object} mediator
 * @param {Object=} options
 */
function CommentBox(options) {
    this.setOptions(options);

    mediator.on('module:identity:validation-email:success', this.verificationEmailSuccess.bind(this));
    mediator.on('module:identity:validation-email:fail', this.verificationEmailFail.bind(this));
}
Component.define(CommentBox);

/**
 * @type {boolean}
 * @override
 */
CommentBox.prototype.useBem = true;

/**
 * @type {string}
 * @override
 */
CommentBox.prototype.templateName = 'comment-box';

/**
 * @type {string}
 * @override
 */
CommentBox.prototype.componentClass = 'd-comment-box';

/**
 * @type {Object.<string.string>}
 * @override
 */
CommentBox.prototype.classes = {};

/**
 * @type {Object.<string.string>}
 * @override
 */
CommentBox.prototype.errorMessages = {
    /* Discussion API error codes - See DAPI exceptions and associated error messages  */
    EMPTY_COMMENT_BODY: 'Please write a comment.',
    COMMENT_TOO_LONG: 'Your comment must be fewer than 5000 characters long.',
    USER_BANNED: 'Commenting has been disabled for this account (<a href="/community-faqs#321a">why?</a>).',
    DISCUSSION_CLOSED: 'Sorry your comment can not be published as the discussion is now closed for comments.',
    PARENT_COMMENT_MODERATED: 'Sorry the comment can not be published as the comment you replied to has been moderated since.',
    COMMENT_RATE_LIMIT_EXCEEDED: 'You can only post one comment every minute. Please try again in a moment.',
    INVALID_PROTOCOL: 'Sorry your comment can not be published as it was not sent over a secure channel. Please report us this issue using the technical issue link in the page footer.',
    AUTH_COOKIE_INVALID: 'Sorry, your comment was not published as you are no longer signed in. Please sign in and try again.',
    'READ-ONLY-MODE': 'Sorry your comment can not currently be published as commenting is undergoing maintenance but will be back shortly. Please try again in a moment.',
    /* Custom error codes */
    API_CORS_BLOCKED: /*CORS blocked by HTTP/1.0 proxy*/'Could not post due to your internet settings, which might be controlled by your provider. Please contact your administrator or disable any proxy servers or VPNs and try again.',
    API_ERROR: 'Sorry, there was a problem posting your comment.  Please try another browser or network connection.  Reference code ',
    EMAIL_VERIFIED: '<span class="d-comment-box__error-meta">Sent. Please check your email to verify ' +
        ' your email address' + '. Once verified post your comment.</span>',
    EMAIL_VERIFIED_FAIL: 'We are having technical difficulties. Please try again later or ' +
        '<a href="/send/email" class="js-id-send-validation-email"><strong>resend the verification</strong></a>.',
    EMAIL_NOT_VALIDATED: 'Please confirm your email address to comment.<br />' +
        'If you can\'t find the email, we can <a href="_#" class="js-id-send-validation-email"><strong>resend the verification email</strong></a> to ' +
        ' your email address' + '.'
};

/**
 * @type {Object.<string.*>}
 */
CommentBox.prototype.defaultOptions = {
    discussionId: null,
    apiRoot: null,
    maxLength: 5000,
    premod: false,
    newCommenter: false,
    hasUsername: true,
    focus: false,
    state: 'top-level',
    replyTo: null,
    priorToVerificationDate: new Date(1392719401337) // Tue Feb 18 2014 10:30:01 GMT
};

/**
 * @type {Array.<string>}
 */
CommentBox.prototype.errors = [];

CommentBox.prototype.getUserData = function() {
    return IdentityApi.getUserFromCookie();
};

/** @override */
CommentBox.prototype.prerender = function() {
    if (!this.options.premod) {
        this.getElem('premod').parentNode.removeChild(this.getElem('premod'));
    }

    var userData = this.getUserData();

    this.getElem('author').innerHTML = userData.displayName;

    if (this.options.state === 'response') {
        this.getElem('submit').innerHTML = 'Post reply';
    } else if (this.options.shouldRenderMainAvatar) {
        var avatar = this.getElem('avatar-wrapper');
        avatar.setAttribute('userid', userData.id);
        avatar.setAttribute('data-userid', userData.id);
        UserAvatars.avatarify(avatar);
    } else {
        var container = document.getElementsByClassName('d-comment-box__meta')[0];
        if (container) {
            container.parentNode.removeChild(container);
        }
    }

    if (this.options.replyTo) {
        var replyToAuthor = this.getElem('reply-to-author');
        replyToAuthor.innerHTML = this.options.replyTo.author;
        this.getElem('parent-comment-author').innerHTML = this.options.replyTo.author + ' @ ' + this.options.replyTo.timestamp + ' said:';

        this.getElem('parent-comment-body').innerHTML = this.options.replyTo.body;

        var setSpoutMargin = function() {
            var spoutOffset = replyToAuthor.offsetLeft + (replyToAuthor.getBoundingClientRect().width / 2);
            this.getElem('parent-comment-spout').style.marginLeft = spoutOffset + 'px';
        };
        window.setTimeout(setSpoutMargin.bind(this), 0);

    }
};

CommentBox.prototype.showOnboarding = function(e) {
    e.preventDefault();

    // Check if new commenter as they may have already commented on this article
    if (this.hasState('onboarding-visible') || !this.options.newCommenter) {
        if (this.options.hasUsername) {
            this.removeState('onboarding-visible');
        }
        this.postComment();
    } else {
        this.getElem('onboarding-author').innerHTML = this.getUserData().displayName;
        this.setState('onboarding-visible');
        this.previewComment(this.onboardingPreviewSuccess);
        if (this.options.hasUsername) {
            this.getElem('onboarding-username').classList.add('is-hidden');
        }
    }
};

CommentBox.prototype.hideOnboarding = function(e) {
    e.preventDefault();
    this.removeState('onboarding-visible');
};

/** @override */
CommentBox.prototype.ready = function() {
    if (this.getDiscussionId() === null) {
        throw new Error('CommentBox: You need to set the "data-discussion-key" on your element');
    }

    var commentBody = this.getElem('body');

    this.setFormState();

    // TODO (jamesgorrie): Could definitely use the this.on and make the default context this

    if (this.options.newCommenter) {
         bean.on(document.body, 'submit', [this.elem], this.showOnboarding.bind(this));
         bean.on(document.body, 'click', this.getClass('onboarding-cancel'), this.hideOnboarding.bind(this));
    } else {
        bean.on(document.body, 'submit', [this.elem], this.submitPostComment.bind(this));
    }

    bean.on(document.body, 'change keyup', [commentBody], this.setFormState.bind(this));
    bean.on(commentBody, 'focus', this.setExpanded.bind(this)); // this isn't delegated as bean doesn't support it

    this.on('change', '.d-comment-box__body', this.resetPreviewComment);
    this.on('click', this.getClass('preview'), this.previewComment.bind(this, this.previewCommentSuccess));
    this.on('click', this.getClass('hide-preview'), this.resetPreviewComment);

    this.on('click', this.getClass('cancel'), this.cancelComment);
    this.on('click', this.getClass('show-parent'), this.setState.bind(this, 'parent-visible', false));
    this.on('click', this.getClass('hide-parent'), this.removeState.bind(this, 'parent-visible', false));

    this.on('click', this.getClass('formatting-bold'), this.formatComment.bind(this, 'bold'));
    this.on('click', this.getClass('formatting-italic'), this.formatComment.bind(this, 'italic'));
    this.on('click', this.getClass('formatting-quote'), this.formatComment.bind(this, 'quote'));
    this.on('click', this.getClass('formatting-link'), this.formatComment.bind(this, 'link'));

    this.setState(this.options.state);

    if (this.options.focus) {
        window.setTimeout(function() {
            this.getElem('body').focus();
        }.bind(this), 0);
    }
};

CommentBox.prototype.urlify = function(str) {
    var reOutsideTags = '(?![^<]*>|[^<>]*</)',
        reUrl = '\\b((https?://|www.)\\S+)\\b',
        regexp = new RegExp(reUrl + reOutsideTags, 'g');
    return str.replace(regexp, function(match, url, protocol) {
        var fullUrl = protocol === 'www.' ? 'http://' + url : url;
        return '<a href="' + fullUrl + '">' + url + '</a>';
    });
};

/**
 * @param {Event}
 */
CommentBox.prototype.submitPostComment = function(e) {
    e.preventDefault();
    this.postComment();
};

CommentBox.prototype.invalidEmailError = function () {
    this.removeState('onboarding-visible');
    this.error('EMAIL_NOT_VALIDATED');
    ValidationEmail.init();
};

CommentBox.prototype.postComment = function() {
    var self = this,
        comment = {
            body: this.elem.body.value
        };

    self.clearErrors();

    var postCommentToDAPI = function () {
        self.removeState('onboarding-visible');
        comment.body = self.urlify(comment.body);
        self.setFormState(true);
        DiscussionApi
            .postComment(self.getDiscussionId(), comment)
            .then(self.postCommentSuccess.bind(self, comment), self.fail.bind(self));
    };

    var updateUsernameSuccess = function (resp) {
        mediator.emit('user:username:updated', resp.user.publicFields.username);
        self.options.hasUsername = true;
        self.getElem('onboarding-username').classList.add('is-hidden');
        postCommentToDAPI();
    };

    var updateUsernameFailure = function (errorResponse) {
        var usernameField = self.getElem('onboarding-username-input');
        self.setState('onboarding-visible');
        usernameField.classList.add('d-comment-box__onboarding-username-error-border');
        var errorMessage = self.getElem('onboarding-username-error-message');
        errorMessage.innerHTML = JSON.parse(errorResponse.responseText).errors[0].description;
        errorMessage.classList.remove('is-hidden');
    };

    var validEmailCommentSubmission = function () {
        if (comment.body === '') {
            self.error('EMPTY_COMMENT_BODY');
        }

        if (comment.body.length > self.options.maxLength) {
            self.error('COMMENT_TOO_LONG', '<b>Comments must be shorter than ' + self.options.maxLength + ' characters.</b>' +
                'Yours is currently ' + (comment.body.length - self.options.maxLength) + ' character(s) too long.');
        }

        if (self.options.replyTo) {
            comment.replyTo = self.options.replyTo;
        }

        if (self.errors.length === 0) {
            if (self.options.newCommenter && !self.options.hasUsername) {
                IdentityApi.updateUsername(self.getElem('onboarding-username-input').value).then(updateUsernameSuccess, updateUsernameFailure);
            } else {
                postCommentToDAPI();
            }
        }
    };

    if (!self.getUserData().emailVerified) {
        // Cookie could be stale so lets refresh and check from the api
        var createdDate = new Date(self.getUserData().accountCreatedDate);
        if (createdDate > self.options.priorToVerificationDate) {
            IdentityApi.getUserFromApiWithRefreshedCookie().then(function (response) {
                if (response.user.statusFields.userEmailValidated === true) {
                    validEmailCommentSubmission();
                } else {
                    self.invalidEmailError();
                }
            });
        } else {
            validEmailCommentSubmission();
        }
    } else {
        validEmailCommentSubmission();
    }
};

/**
 * TODO (jamesgorrie): Perhaps change error states to use bit operators
 * @param {string} type
 * @param {string} message Overrides the default message
 */
CommentBox.prototype.error = function(type, message) {

    message = message || this.errorMessages[type];

    this.setState('invalid');
    var error = bonzo.create(
        '<div class="d-discussion__error ' + this.getClass('error', true) + '">' +
            '<i class="i i-alert"></i>' +
            '<span class="d-discussion__error-text">' + message + '</span>' +
        '</div>'
    )[0];
    this.getElem('messages').appendChild(error);
    this.errors.push(type);
};

/**
 * @param {Object} comment
 * @param {Object} resp
 */
CommentBox.prototype.postCommentSuccess = function(comment, resp) {
    if (this.options.newCommenter) {
        this.refreshUsernameHtml();
        this.options.newCommenter = false;
    }

    comment.id = parseInt(resp.message, 10);
    this.getElem('body').value = '';
    this.resetPreviewComment();
    this.setFormState();
    this.emit('post:success', comment);
    mediator.emit('discussion:commentbox:post:success', comment);
};

/**
 * TODO (jamesgorrie); Make this more robust
 * @param {Reqwest=} resp (optional)
 */
CommentBox.prototype.fail = function(xhr) {
    var response;
    // if our API is down, it returns HTML
    // this is not so good for JSON.parse
    try { response = JSON.parse(xhr.responseText); }
        catch (e) { response = {}; }

    this.setFormState();

    if (xhr.status == 0) {
        this.error('API_CORS_BLOCKED');
    } else if (response.errorCode === 'EMAIL_NOT_VALIDATED') {
        this.invalidEmailError();
    } else if (this.errorMessages[response.errorCode]) {
        this.error(response.errorCode);
    } else {
        this.error('API_ERROR', this.errorMessages.API_ERROR + xhr.status);// templating would be ideal here
    }
};

CommentBox.prototype.onboardingPreviewSuccess = function(comment, resp) {
    this.getElem('onboarding-preview-body').innerHTML = resp.commentBody;
};

/**
 * @param {Object} comment
 * @param {Object} resp
 */
CommentBox.prototype.previewCommentSuccess = function(comment, resp) {
    this.getElem('preview-body').innerHTML = resp.commentBody;
    this.setState('preview-visible');
};

/**
 * TODO: remove the replace, get the Scala to be better
 * @return {string}
 */
CommentBox.prototype.getDiscussionId = function() {
    return this.options.discussionId || this.elem.getAttribute('data-discussion-key').replace('discussion', '');
};

/**
 * Set the form to be postable or not dependant on the comment
 * @param {Boolean|Event=} disabled (optional)
 */
CommentBox.prototype.setFormState = function(disabled) {
    disabled = typeof disabled === 'boolean' ? disabled : false;

    var commentBody = this.getElem('body'),
        submitButton = this.getElem('submit');

    if (disabled || commentBody.value.length === 0) {
        submitButton.setAttribute('disabled', 'disabled');
    } else {
        submitButton.removeAttribute('disabled');
    }
};

CommentBox.prototype.clearErrors = function() {
    this.getElem('messages').innerHTML = '';
    this.errors = [];
    this.removeState('invalid');
};

/**
 * @param {Event=} e (optional)
 */
CommentBox.prototype.setExpanded = function() {
    this.setState('expanded');
};

/**
 * @param {Event=} e (optional)
 */
CommentBox.prototype.verificationEmailSuccess = function() {
    this.clearErrors();
    this.error('EMAIL_VERIFIED');
};

/**
 * @param {Event=} e (optional)
 */
CommentBox.prototype.verificationEmailFail = function() {
    this.clearErrors();
    this.error('EMAIL_VERIFIED_FAIL');
};

/**
 * @param {Event=} e (optional)
 */
CommentBox.prototype.previewComment = function(callback) {
    var self = this,
        comment = {
            body: this.getElem('body').value
        };

    self.clearErrors();

    if (comment.body === '') {
        this.resetPreviewComment();
        self.error('EMPTY_COMMENT_BODY');
    }

    if (comment.body.length > self.options.maxLength) {
        self.error('COMMENT_TOO_LONG', '<b>Comments must be shorter than ' + self.options.maxLength + ' characters.</b>' +
            'Yours is currently ' + (comment.body.length - self.options.maxLength) + ' characters too long.');
    }

    if (self.errors.length === 0) {
        DiscussionApi
            .previewComment(comment)
            .then(callback.bind(self, comment), self.fail.bind(self));
    }
};

/**
 * @param {Event=} e (optional)
 */
CommentBox.prototype.cancelComment = function() {
    if (this.options.state === 'response') {
        this.destroy();
    } else {
        this.resetPreviewComment();
        this.getElem('body').value = '';
        this.setFormState();
        this.removeState('expanded');
    }
};



CommentBox.prototype.resetPreviewComment = function() {
    this.removeState('preview-visible');
    this.getElem('preview-body').innerHTML = '';
};

/**
 *
 * @param {String=} formatStyle
 */
CommentBox.prototype.formatComment = function(formatStyle) {

    var commentBody = this.getElem('body');
    var cursorPositionStart = commentBody.selectionStart;
    var selectedText = commentBody.value.substring(commentBody.selectionStart, commentBody.selectionEnd);

    var selectNewText = function(newText) {
        commentBody.setSelectionRange(cursorPositionStart, cursorPositionStart + newText.length);
    };

    var formatSelection = function(startTag, endTag) {
        var newText = startTag + selectedText + endTag;

        commentBody.value = commentBody.value.substring(0, commentBody.selectionStart) +
            newText + commentBody.value.substring(commentBody.selectionEnd);

        selectNewText(newText);
    };

    var formatSelectionLink = function() {
        var href;
        var linkURL;
        if (/^https?:\/\//i.test(selectedText)) {
            href = selectedText;
        } else {
            linkURL = window.prompt('Your URL:', 'http://www.');
            href = linkURL;

            selectedText = selectedText || linkURL;
        }
        var newText = '<a href="' + href + '">' + selectedText + '</a>';

        commentBody.value = commentBody.value.substring(0, commentBody.selectionStart) +
            newText + commentBody.value.substring(commentBody.selectionEnd);
    };

    switch(formatStyle) {
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
};


// When the user updates the username the changes are visible only when the page is refreshed. This method
// temporarily updates HTML client-side so that user has instant feedback before the page is refreshed.
CommentBox.prototype.refreshUsernameHtml = function() {
    IdentityApi.reset();
    var displayName = this.getUserData().displayName;
    var menuHeaderUsername = $('.js-profile-info')[0];
    var discussionHeaderUsername = $('._author_tywwu_16')[0];
    menuHeaderUsername && (menuHeaderUsername.innerHTML = displayName);
    discussionHeaderUsername && (discussionHeaderUsername.innerHTML = displayName);
};

return CommentBox;

}); // define
