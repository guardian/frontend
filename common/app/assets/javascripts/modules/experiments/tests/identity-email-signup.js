define([
    "utils/mediator",
    "modules/identity/email-signup",
    "modules/identity/api"
], function (mediator, EmailSignup, IdApi) {
     
    var EmailSignupTest = function () {

        var _config;
        this.id = 'EmailSignup';
        this.expiry = '2014-01-15';
        this.audience = 0.2;
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
                id: 'email-signup-left',
                test: function() {
                    this.component = new EmailSignup(document.getElementById('preload-1'), 'left');
                }
            }
        ];
    };

    return EmailSignupTest;
});