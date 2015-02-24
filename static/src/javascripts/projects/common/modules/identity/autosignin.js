define([
    'bonzo',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/time',
    'common/modules/identity/api',
    'common/modules/identity/facebook-authorizer',
    'common/modules/navigation/profile',
    'common/modules/ui/message'
],
function (
    bonzo,
    ajax,
    config,
    time,
    id,
    FacebookAuthorizer,
    Profile,
    Message
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
                        var profile = new Profile(
                            self.header,
                            {
                                url: config.page.idUrl
                            }
                        );
                        profile.init();

                        s.eVar36 = 'facebook auto';
                        s.linkTrackVars = 'eVar36';
                        s.tl(this, 'o', 'Social signin auto');
                    }
                }
            });
        };

        this.welcome = function (name) {
            var msg = '<p class="site-message__message">' +
                          'Welcome ' + name + ', you’re signed into the Guardian using Facebook, or ' +
                          '<a href="' + config.page.idUrl + '/signout"/>sign out</a>.' +
                      '</p>';
            new Message('fbauto', { important: true }).show(msg);
        };
    }
    return AutoSignin;
});
