define([
    "common/utils/mediator",
    "common/modules/identity/email-signup",
    "common/modules/identity/api"
], function (mediator, EmailSignup, IdApi) {

    var EmailSignupTest = function () {

        var _config;
        this.id = 'EmailSignup';
        this.expiry = '2014-02-14';
        this.audience = 0.2;
        this.audienceOffset = 0.1;
        this.description = 'Displays email signup button on relevant article pages';
        this.canRun = function (config) {
            _config = config;
            return true;
        };
        this.variants = [
            {
                id: 'email-signup-left-meta-alt',
                test: function() {
                    this.component = new EmailSignup(document.getElementById('preload-1'));
                }
            }
        ];
    };

    return EmailSignupTest;
});
