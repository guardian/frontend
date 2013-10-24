/*global FB:false*/
define([''], function() {

    var instance = null;

    function FacebookAuthorizer(appId) {
        instance = this;
        this.appId = appId;
        this.onConnected = new RepeatablePromise();
        this.onFBScriptLoaded = new RepeatablePromise();
        this.onUserDataLoaded = new RepeatablePromise();
        this.onNotAuthorized = new RepeatablePromise();
        this.onNotLoggedIn = new RepeatablePromise();
        this.cancelledLogin = new RepeatablePromise();
    }

    FacebookAuthorizer.DEFAULT_PERMISSIONS = {scope: 'email,publish_actions,publish_stream'};

    FacebookAuthorizer.prototype.onConnected = null;

    FacebookAuthorizer.prototype.onFBScriptLoaded = null;

    FacebookAuthorizer.prototype.onUserDataLoaded = null;

    FacebookAuthorizer.prototype.onNotAuthorized = null;

    FacebookAuthorizer.prototype.onNotLoggedIn = null;

    FacebookAuthorizer.prototype.cancelledLogin = null;

    FacebookAuthorizer.accessToken = null;

    FacebookAuthorizer.userId = null;

    FacebookAuthorizer.userData = null;

    FacebookAuthorizer.prototype.login = function (permissions, force) {
        if (force || (!this.accessToken && !this.loginPending)) {
            this.cancelledLogin.reset();
            this.onConnected.reset();
            this.loginPending = true;
            this._loadFacebookAPI().then(function (FB) {
                FB.login(this._handleGotLoginStatus.bind(this, true), permissions || FacebookAuthorizer.DEFAULT_PERMISSIONS);
            }.bind(this));
        }
        return this.onConnected;
    };

    FacebookAuthorizer.prototype.getLoginStatus = function (permissions) {
        if (!this.loginStatusPending) {
            this.loginStatusPending = true;
            this._loadFacebookAPI().then(function (FB) {
                FB.getLoginStatus(this._handleGotLoginStatus.bind(this, false), permissions || FacebookAuthorizer.DEFAULT_PERMISSIONS);
            }.bind(this));
        }
        return this.onConnected;
    };

    var scriptId = 'facebook-jssdk';

    FacebookAuthorizer.prototype._handleGotLoginStatus = function (wasDirectUserAction, response) {
        this.loginStatusPending = false;
        this.loginPending = false;
        switch (response.status) {
            case 'connected':
                this.accessToken = response.authResponse.accessToken;
                this.userId = response.authResponse.userID;
                this._getUserData();
                this.onConnected.resolve(FB, response.authResponse);
                break;
            case 'not_authorized':
                this._getUserData();
                this.onNotAuthorized.resolve(this);
                break;
            default:
                if (wasDirectUserAction) {
                    this.cancelledLogin.resolve();
                }
                this.onNotLoggedIn.resolve();
        }
    };

    FacebookAuthorizer.prototype._getUserData = function () {
        FB.api("/me", this._handleGotUserData.bind(this));
    };

    FacebookAuthorizer.prototype._handleGotUserData = function (data) {
        if (data && !data.error) {
            this.userData = data;
            this.onUserDataLoaded.resolve(data);
        }
    };

    FacebookAuthorizer.prototype._loadFacebookAPI = function () {
        if (window.FB) {
            this.onFBScriptLoaded.resolve(window.FB);
        } else if (!document.getElementById(scriptId) && !this._requiredAlready) {
            this._requiredAlready = true;
            this._loadFacebookScript();
        }
        return this.onFBScriptLoaded;
    };

    FacebookAuthorizer.prototype._loadFacebookScript = function () {
        require(['js!facebook'], this._handleScriptLoaded.bind(this));
    };

    FacebookAuthorizer.prototype._handleScriptLoaded = function () {

        FB.init({
            appId: this.appId,
            status: true, // check login status
            cookie: true, // enable cookies to allow the server to access the session
            xfbml: true // parse XFBML
        });

        this.onFBScriptLoaded.resolve(FB);

    };

    FacebookAuthorizer.prototype.destroy = function () {
        instance = null;
    };

    function RepeatablePromise() {
        this.callbacks = [];
    }

    RepeatablePromise.prototype.resolve = function () {
        this.args = Array.prototype.slice.apply(arguments);
        var i, numCallbacks = this.callbacks.length;
        for (i = 0; i < numCallbacks; i++) {
            this.callbacks[i].apply(null, this.args);
        }
        this.callbacks = [];
    };

    RepeatablePromise.prototype.then = function (fn) {
        if (this.args !== undefined) {
            fn.apply(null, this.args);
        } else {
            this.callbacks.push(fn);
        }
    };

    RepeatablePromise.prototype.reset = function() {
        this.args = undefined;
    };

    return FacebookAuthorizer;
});
