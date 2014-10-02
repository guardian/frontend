define([
    'common/utils/$',
    'bean',
    'bonzo',
    'common/utils/config',
    'common/utils/mediator',
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
    this.mediator = mediator;
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
    EMPTY_COMMENT_BODY: 'Please write a comment.',
    COMMENT_TOO_LONG: 'Your comment must be fewer than 5000 characters long.',
    COMMENT_NEEDS_SENTIMENT: 'Please select yes or no.',
    ENHANCE_YOUR_CALM: 'You can only post one comment every minute. Please try again in a moment.',
    USER_BANNED: 'Commenting has been disabled for this account (<a href="/community-faqs#321a">why?</a>).',
    API_ERROR: 'Sorry, there was a problem posting your comment.',
    EMAIL_VERIFIED: '<span class="d-comment-box__error-meta">Sent. Please check your email to verify '+
        (IdentityApi.getUserFromCookie() ? IdentityApi.getUserFromCookie().primaryEmailAddress : ' your email address') +'. Once verified post your comment.</span>',
    EMAIL_VERIFIED_FAIL: 'We are having technical difficulties. Please try again later or '+
        '<a href="/send/email" class="js-id-send-validation-email"><strong>resend the verification</strong></a>.',
    EMAIL_NOT_VERIFIED: 'Please confirm your email address to post your first comment.<br />'+
        '<a href="_#" class="js-id-send-validation-email"><strong>Send verification email</strong></a><span class="d-comment-box__error-meta"> to '+
        (IdentityApi.getUserFromCookie() ? IdentityApi.getUserFromCookie().primaryEmailAddress : ' your email address') + '.</span>'
};

/**
 * @type {Object.<string.*>}
 */
CommentBox.prototype.defaultOptions = {
    discussionId: null,
    apiRoot: null,
    maxLength: 5000,
    premod: false,
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
    } else {
        var avatar = this.getElem('avatar-wrapper');
        avatar.setAttribute('userid', userData.id);
        UserAvatars.avatarify(avatar);
    }

    if (this.options.replyTo) {
        var replyToAuthor = this.getElem('reply-to-author');
        replyToAuthor.innerHTML = this.options.replyTo.author;
        this.getElem('parent-comment-author').innerHTML = this.options.replyTo.author + ' @ ' + this.options.replyTo.timestamp + ' said:';

        this.getElem('parent-comment-body').innerHTML = this.options.replyTo.body;

        var setSpoutMargin = function() {
            var spoutOffset = replyToAuthor.offsetLeft + (replyToAuthor.getBoundingClientRect().width/2);
            this.getElem('parent-comment-spout').style.marginLeft = spoutOffset + 'px';
        };
        window.setTimeout(setSpoutMargin.bind(this), 0);

    }
};

/** @override */
CommentBox.prototype.ready = function() {
    if (this.getDiscussionId() === null) {
        throw new Error('CommentBox: You need to set the "data-discussion-key" on your element');
    }

    var commentBody = this.getElem('body');

    this.setFormState();

    // TODO (jamesgorrie): Could definitely use the this.on and make the default context this
    bean.on(document.body, 'submit', [this.elem], this.postComment.bind(this));
    bean.on(document.body, 'change keyup', [commentBody], this.setFormState.bind(this));
    bean.on(commentBody, 'focus', this.setExpanded.bind(this)); // this isn't delegated as bean doesn't support it
    this.on('click', this.getClass('preview'), this.previewComment);
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
        this.getElem('body').focus();
    }

    if (config.switches.sentimentalComments) {
        setTimeout(function() {
            $('.open a[href="#comments"]').each(function (openLink) {
                var sentimentActiveClass = 'd-comment-box__sentiment--active';
                this.setState('sentimental');
                this.options.maxLength = 350;

                $.create('<div>' + $('.open__head__accent').text() + '</div>')
                    .addClass('d-comment-box__sentiments-head tone-news tone-colour')
                    .insertAfter(this.getElem('sentiments'));

                bean.on(openLink, 'click', function (e) {
                    this.getElem('body').focus();
                    e.preventDefault();
                }.bind(this));

                bean.on(this.elem, 'click', this.getClass('sentiment'), function (e) {
                    $('.' + sentimentActiveClass, this.elem).removeClass(sentimentActiveClass);
                    $(e.currentTarget).addClass(sentimentActiveClass);
                    this.elem.sentiment.value = e.currentTarget.getAttribute('data-value');
                    this.getElem('body').focus();
                }.bind(this));
            }.bind(this));
        }.bind(this), 800);
    }
};

/**
 * @param {Event}
 */
CommentBox.prototype.postComment = function(e) {
    var self = this,
        comment = {
            body: this.elem.body.value
        };

    if (this.elem.sentiment.value) {
        comment.sentiment = this.elem.sentiment.value;
    }

    e.preventDefault();
    self.clearErrors();

    var validEmailCommentSubmission = function () {
        if (comment.body === '') {
            self.error('EMPTY_COMMENT_BODY');
        }

        if (comment.body.length > self.options.maxLength) {
            self.error('COMMENT_TOO_LONG', '<b>Comments must be shorter than '+ self.options.maxLength +' characters.</b>'+
                'Yours is currently '+ (comment.body.length-self.options.maxLength) +' character(s) too long.');
        }

        if (self.hasState('sentimental') && !comment.sentiment) {
            self.error('COMMENT_NEEDS_SENTIMENT');
        }

        if (self.options.replyTo) {
            comment.replyTo = self.options.replyTo;
        }

        if (self.errors.length === 0) {
            self.setFormState(true);
            DiscussionApi
                .postComment(self.getDiscussionId(), comment)
                .then(self.postCommentSuccess.bind(self, comment), self.fail.bind(self));
        }
    };

    var invalidEmailError = function () {
        self.error('EMAIL_NOT_VERIFIED');
        ValidationEmail.init();
    };

    if (!self.getUserData().emailVerified) {
        // Cookie could be stale so lets refresh and check from the api
        var createdDate = new Date(self.getUserData().accountCreatedDate);
        if (createdDate > self.options.priorToVerificationDate) {
            IdentityApi.getUserFromApiWithRefreshedCookie().then(function (response) {
                if (response.user.statusFields.userEmailValidated === true) {
                    validEmailCommentSubmission();
                } else {
                    invalidEmailError();
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
        '<div class="d-discussion__error '+ this.getClass('error', true) +'">'+
            '<i class="i i-alert"></i>'+
            '<span class="d-discussion__error-text">'+ message +'</span>'+
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
    comment.id = parseInt(resp.message, 10);
    this.getElem('body').value = '';
    this.resetPreviewComment();
    this.setFormState();
    this.emit('post:success', comment);
    this.mediator.emit('discussion:commentbox:post:success', comment);
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

    if (xhr.status === 420) {
        this.error('ENHANCE_YOUR_CALM');
    } else if (this.errorMessages[response.errorCode]) {
        this.error(response.errorCode);
    } else {
        this.error('API_ERROR');
    }
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
CommentBox.prototype.previewComment = function(e) {
    var self = this,
        comment = {
            body: this.getElem('body').value
        };

    e.preventDefault();
    self.clearErrors();

    if (comment.body === '') {
        this.resetPreviewComment();
        self.error('EMPTY_COMMENT_BODY');
    }

    if (comment.body.length > self.options.maxLength) {
        self.error('COMMENT_TOO_LONG', '<b>Comments must be shorter than '+ self.options.maxLength +' characters.</b>'+
            'Yours is currently '+ (comment.body.length-self.options.maxLength) +' characters too long.');
    }

    if (self.errors.length === 0) {
        DiscussionApi
            .previewComment(comment)
            .then(self.previewCommentSuccess.bind(self, comment), self.fail.bind(self));
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
    var selectedText = commentBody.value.substring(commentBody.selectionStart,commentBody.selectionEnd);

    var formatSelection = function(startTag,endTag) {
        var newText = startTag + selectedText + endTag;

        commentBody.value = commentBody.value.substring(0, commentBody.selectionStart)+
            newText + commentBody.value.substring(commentBody.selectionEnd);

        selectNewText(newText);
    };

    var formatSelectionLink = function() {
        var href;

        if (/^https?:\/\//i.test(selectedText)) {
            href = selectedText;
        } else {
            href = 'http://';
        }
        var newText = '<a href="' + href + '">' + selectedText + '</a>';

        commentBody.value = commentBody.value.substring(0, commentBody.selectionStart) +
            newText + commentBody.value.substring(commentBody.selectionEnd);

        selectNewText(newText);
    };

    var selectNewText = function(newText) {
        commentBody.setSelectionRange(cursorPositionStart,cursorPositionStart+newText.length);
    };

    switch(formatStyle) {
        case 'bold':
            formatSelection('<b>','</b>');
            break;
        case 'italic':
            formatSelection('<i>','</i>');
            break;
        case 'quote':
            formatSelection('<blockquote>','</blockquote>');
            break;
        case 'link':
            formatSelectionLink();
            break;
    }
};

return CommentBox;

}); // define
