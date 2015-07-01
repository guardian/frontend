/*global s*/
define([
    'bonzo',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/time',
    'common/modules/analytics/omniture',
    'common/modules/identity/api',
    'common/modules/identity/facebook-authorizer',
    'common/modules/navigation/profile',
    'common/modules/ui/message',
    'common/modules/ui/toggles'
],
function (
    bonzo,
    ajax,
    config,
    time,
    omniture,
    id,
    FacebookAuthorizer,
    Profile,
    Message,
    Toggles
) {

    function AutoSignin() {
        var self = this;
        self.header = document.body;

        this.init = function () {

            if (id.shouldAutoSigninInUser()) {
                var appId = config.page.fbAppId,
                    authorizer = new FacebookAuthorizer(appId);

                authorizer.getLoginStatus();

                authorizer.onConnected.then(function (FB, statusResponse) {
                    authorizer.onUserDataLoaded.then(function (userData) {
                        if (userData.email) {
                            self.signin(statusResponse, userData.name);
                        }
                    });
                });

                authorizer.onNotLoggedIn.then(function () {
                    var today = time.currentDate();
                    id.setNextFbCheckTime(today.setDate(today.getDate() + 1));
                });

                authorizer.onNotAuthorized.then(function () {
                    var today = time.currentDate();
                    id.setNextFbCheckTime(today.setMonth(today.getMonth() + 1));
                });
            }
        };

        this.signin = function (authResponse, name) {
            ajax({
                url: config.page.idWebAppUrl + '/jsapi/facebook/autosignup',
                cache: false,
                crossOrigin: true,
                type: 'jsonp',
                data: {
                    signedRequest: authResponse.signedRequest,
                    accessToken: authResponse.accessToken
                },
                success: function (response) {
                    self.welcome(name);
                    if (response.status === 'ok') {
                        var profile = new Profile({
                            url: config.page.idUrl
                        });
                        profile.init();
                        new Toggles().init();

                        omniture.populateEventProperties('Social signin auto');
                        s.eVar13 = 'facebook auto';
                        s.linkTrackVars += ',eVar13';
                        s.tl(this, 'o', 'Social signin auto');
                    }
                }
            });
        };

        this.welcome = function (name) {
            var msg = '<p class="site-message__message" data-test-id="facebook-auto-sign-in-banner">' +
                          'Welcome ' + name + ', you’re signed in to the Guardian using Facebook. ' +
                          '<a data-link-name="fb auto : sign out" href="' + config.page.idUrl + '/signout"/>Sign out</a>.' +
                      '</p>';
            new Message('fbauto', { important: true }).show(msg);
        };
    }
    return AutoSignin;
});
