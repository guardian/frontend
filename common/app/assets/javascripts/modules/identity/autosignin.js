define([
    "ajax",
    "bonzo",
    "common",
    "modules/id",
    "modules/identity/facebook-authorizer",
    "modules/navigation/profile",
    "modules/storage",
    "modules/userPrefs",
    "modules/time"
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
    time
) {

    function AutoSignin(config) {
        this.config = config;
        var self = this;
        self.header = document.body;

        this.init = function() {

            var fbCheckKey = "gu.id.nextFbCheck";

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
                    Storage.set(fbCheckKey,{},{expires: today.setDate(today.getDate() + 1)});
                });

                authorizer.onNotAuthorized.then( function() {
                    var today = time.currentDate();
                    Storage.set(fbCheckKey,{},{expires: today.setMonth(today.getMonth() + 1)});
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
                    self.writeFacebookWelcome(name);
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

        this.writeFacebookWelcome = function(name) {

            var showReleaseMessage = !!UserPrefs.get('releaseMessage');

            if ( !showReleaseMessage ) {
                var alphaMessage = bonzo(common.$g('.site-message__message')).remove(),
                    p_message = bonzo(bonzo.create('<p class="site-message__message site-message__message--tall">' +
                    'Welcome ' + name + ', you\'re signed into the Guardian using Facebook, or' +
                    '<a href="' + self.config.page.idUrl + '/signout"/> sign out</a>.</p>'));

                bonzo(common.$g('.site-message__inner')).prepend(p_message);
                bonzo(common.$g('.site-message__actions')).remove();
            } else {
                var element = document.body,
                    html = '<div class="site-message" data-link-name="facebook autosign message">' +
                    '<div class="site-message__inner">' +
                    '<p class="site-message__message">' +
                    'Welcome ' + name + ', you\'re signed into the Guardian using Facebook, or' +
                    '<a href="' + self.config.page.idUrl + '/signout"/> sign out</a>.' +
                    '</p></div></div>';

                bonzo(element).prepend(bonzo.create(html));
            }
            common.$g('#header').addClass('js-site-message');
        };
    }
    return AutoSignin;
});