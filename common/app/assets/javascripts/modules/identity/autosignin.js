define([
    "utils/ajax",
    "bonzo",
    "common",
    "modules/identity/api",
    "modules/identity/facebook-authorizer",
    "modules/navigation/profile",
    "utils/storage",
    "modules/userPrefs",
    "utils/time",
    "modules/ui/message"
],
function(
    ajax,
    bonzo,
    common,
    Id,
    FacebookAuthorizer,
    Profile,
    Storage,
    UserPrefs,
    time,
    Message
) {

    function AutoSignin(config, context) {
        this.config = config;
        this.context = context;
        var self = this;
        self.header = document.body;

        this.init = function() {

            if( Id.shouldAutoSigninInUser() ) {
                var appId = this.config.page.fbAppId;

                var authorizer = new FacebookAuthorizer(appId);
                authorizer.getLoginStatus();

                authorizer.onConnected.then( function(FB, statusResponse) {
                    authorizer.onUserDataLoaded.then( function(userData) {
                        if( userData.email ) {
                            self.signin( statusResponse, userData.name );
                        }
                    });
                });

                authorizer.onNotLoggedIn.then( function() {
                    var today = time.currentDate();
                    Id.setNextFbCheckTime(today.setDate(today.getDate() + 1));
                });

                authorizer.onNotAuthorized.then( function() {
                    var today = time.currentDate();
                    Id.setNextFbCheckTime(today.setMonth(today.getMonth() + 1));
                });
            }
        };

        this.signin = function(authResponse, name) {
            ajax({
                url:self.config.page.idWebAppUrl + '/jsapi/facebook/autosignup',
                cache: false,
                crossOrigin: true,
                type: 'jsonp',
                data: {
                    signedRequest : authResponse.signedRequest,
                    accessToken : authResponse.accessToken
                },
                success: function(response) {
                    self.welcome(name);
                    if(response.status === "ok") {
                        var profile = new Profile(
                            self.header,{
                            url: self.config.page.idUrl
                        });
                        profile.init();
                    }
                }
            });
        };

        this.welcome = function(name) {
            var msg = '<p class="site-message__message">' +
                          'Welcome ' + name + ", you're signed into the Guardian using Facebook, or " +
                          '<a href="' + self.config.page.idUrl + '/signout"/>sign out</a>.' +
                      '</p>',
                fbMessage = new Message('fbauto', { important: true }).show(msg);
        };
    }
    return AutoSignin;
});
