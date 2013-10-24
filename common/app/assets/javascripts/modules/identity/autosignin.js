define([
    "ajax",
    "bonzo",
    "common",
    "modules/navigation/profile",
    "modules/identity/facebook-authorizer",
    "modules/id"
],
function(
    ajax,
    bonzo,
    common,
    Profile,
    FacebookAuthorizer,
    Id
) {

    function AutoSignin(config) {
        this.config = config;
        var self = this;
        self.header = document.body;

        this.init = function() {

            if( Id.shouldAutoSigninInUser() ) {
                var appId = this.config.page.idFacebookAppId;

                var authorizer = new FacebookAuthorizer(appId);
                authorizer.getLoginStatus();

                authorizer.onConnected.then( function(FB, statusResponse) {
                    authorizer.onUserDataLoaded.then( function(userData) {
                        var name = userData.name;
                        if( userData.email ) {
                            self.signin( statusResponse, name );
                        }
                    });
                });
            }
        };

        this.signin = function(authResponse, name) {
            ajax({
                url: this.config.page.idWebAppUrl + '/jsapi/facebook/autosignup',
                cache: false,
                crossOrigin: true,
                type: 'jsonp',
                data: {
                    signedRequest : authResponse.signedRequest,
                    accessToken : authResponse.accessToken
                },
                success: function(response) {
                    if(response.status === "ok") {
                       var profile = new Profile(
                         self.header,{
                         url: self.config.page.idUrl
                       });
                       profile.init();
                       self.writeFacebookWelcome(name);
                    }
                }
            });
        };

        this.writeFacebookWelcome = function(name) {

            var element = document.body;

            var html = "<div class=\"site-message\" data-link-name=\"facebook autosign message\">" +
                "<div class=\"site-message__inner\">" +
                "<p class=\"site-message__message\">" +
                "Welcome " + name +", you're signed into the Guardian using facebook, click here to " +
                "<a href=\"" + self.config.page.idUrl + "/signout\"/>Sign out</a>." +
                "</p></div></div>";

            var divBlock = bonzo(element).prepend(bonzo.create(html));
            common.$g('#header').addClass('js-site-message');


        };
    }
    return AutoSignin;
});