define([
    "common/utils/mediator",
    "common/modules/identity/email-signup",
    "common/modules/identity/api"
], function (mediator, EmailSignup, IdApi) {
     
    var EmailSignupTest = function () {

        var _config;
        this.id = 'EmailSignup';
        this.expiry = '2014-01-24';
        this.audience = 0.2;
        this.audienceOffset = 0.1;
        this.description = 'Displays email signup button on relevant article pages';
        this.canRun = function (config) {
            _config = config;
            return IdApi.isUserLoggedIn();
        };
        this.variants = [
            {
                id: 'control',
                test: function (context) {
                    return true;
                }
            },
            {
                id: 'email-signup-inline',
                test: function() {
                    this.component = new EmailSignup(document.getElementById('preload-1'), 'inline');
                }
            },
            {
                id: 'email-signup-inline-alt',
                test: function() {
                    this.component = new EmailSignup(document.getElementById('preload-1'), 'inline-alt');
                }
            },
            {
                id: 'email-signup-left-body',
                test: function() {
                    var hasCards = document.querySelectorAll('.article-body .card-wrapper').length > 0; // Left-Body variant should only show when no left-hand-cards present
                    if (!hasCards) {
                        this.component = new EmailSignup(document.getElementById('preload-1'), 'left-body');
                    }
                }
            },
            {
                id: 'email-signup-left-body-alt',
                test: function() {
                    var hasCards = document.querySelectorAll('.article-body .card-wrapper').length > 0; // Left-Body variant should only show when no left-hand-cards present
                    if (!hasCards) {
                        this.component = new EmailSignup(document.getElementById('preload-1'), 'left-body-alt');
                    }
                }
            },
            {
                id: 'email-signup-left-meta',
                test: function() {
                    this.component = new EmailSignup(document.getElementById('preload-1'), 'left-meta');
                }
            },
            {
                id: 'email-signup-left-meta-alt',
                test: function() {
                    this.component = new EmailSignup(document.getElementById('preload-1'), 'left-meta-alt');
                }
            }
        ];
    };

    return EmailSignupTest;
});
