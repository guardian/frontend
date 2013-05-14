// TODO: Check on preprocessing of endpoints
var IDENTITY = IDENTITY || {};

(function (name, context, definition) {
    'use strict';
    if (typeof module !== 'undefined' && module.exports) module.exports = definition();
    else if (typeof define === 'function' && define.amd) {
        define(name, definition);
        define(definition);
    } else context[name] = definition();
}('guardian_idToolkit', IDENTITY, function() {
    'use strict';
    var pubsub, ajax, sdk,
        empty = function() {},
        urls = {
            validFrom: 'guardian.co.uk',
            api: 'https://id.guardianapis.com',
            web: 'https://id.guardian.co.uk'
        },
        cookies = {
            user: 'GU_U'
        },
        policies = [                             {packageCode: 'BTH', path: '/sys/policies/been-there'}
                                            , {packageCode: 'CRE', path: '/sys/policies/basic-identity'}
                                            , {packageCode: 'RCO', path: '/sys/policies/basic-community'}
                                            , {packageCode: 'GEXT', path: '/sys/policies/extra'}
                                            , {packageCode: 'GRS', path: '/sys/policies/guardian-jobs'}
                                            , {packageCode: 'TVL', path: '/sys/policies/tv-listings'}
                                            , {packageCode: 'TNDF', path: '/sys/policies/newspaper-direct'}
                                            , {packageCode: 'GTNF', path: '/sys/policies/teachers-network'}
                                            , {packageCode: 'DAR', path: '/sys/policies/digital-archive'}
                                            , {packageCode: 'YCL', path: '/sys/policies/clippings'}
                                            , {packageCode: 'GHO', path: '/sys/policies/holiday-offers'}
                                            , {packageCode: 'N0TICE', path: '/sys/policies/n0tice'}
                                    ],
        endpoints = {
            'user/me': {
                uri: '/user/me?encode=signedResponse',
                methods: ['get'],
                cache: true,
                exports: 'user',
                preprocess: function(res) {
                    var userData,
                        responseParts = res.split('.'),
                        rawData = responseParts[0];

                    userData = JSON.parse(decodeBase64(rawData));

                    if (userData.status === 'ok') {
                        return userData.user;
                    } else {
                        return userData;
                    }
                }
            },
            //depricated
            'user/me/email/subscribe': {
                uri: '/useremails/:me/subscriptions',
                methods: ['get', 'post', 'delete'],
                exports: 'subscriptions'
            },
            'useremails/me/subscriptions': {
                uri: '/useremails/:me/subscriptions',
                methods: ['get', 'post', 'delete'],
                exports: 'subscriptions'
            }
        };

    /**
     * API
     */
    function api() {
        var call, url, data,
            success, error, callback, failure,
            params = {}, method = 'get',
            arg, argType,
            endpoint;

        for (var i = 0, len = arguments.length; i < len; i++) {
            arg = arguments[i];

            if (i === 0) { call = arg; continue; }
            argType = (typeof arg).toLowerCase();

            switch (argType) {
                case 'string':
                    method = arg;
                    break;
                case 'object':
                    params = arg;
                    break;
                case 'function':
                    if (callback) { failure = arg; }
                    else { callback = arg; }
                    break;
            }
        }

        endpoint = endpoints[call];
        if (!endpoint) {
            endpoint = {
                uri : '/' + call,
                methods: ['get', 'post', 'delete']
            }
        }

        // callback handling
        if (!callback) { success = function(){}; }
        if (!failure) { failure = function(){}; }

        error = failure; // This might come in handy

        if (endpoint.preprocess) {
            success = function(res) {
                res = endpoint.preprocess(res);
                callback(res);
            };
        } else { success = callback; }

        // a little magic
        url = urls.api + endpoint.uri.replace(':me', localUserData().id);
        data = { body: JSON.stringify(params) };
        if (method) { data.method = method; } // this is just till we have a better way

        if (!endpoint.cache) {
            ajax({
                url: url,
                dataType: 'jsonp',
                data: data,
                success: function(res) {
                    if (res.status === 'ok') {
                        success(res);
                    } else {
                        error(res);
                    }
                }
            });
        } else {
            if (!endpoint.started) {
                endpoint.started = true;
                endpoint.callbacks = endpoint.callbacks || { success: [], error: [] };
                endpoint.callbacks.success.push(success);
                endpoint.callbacks.error.push(failure);

                ajax({
                    url: url,
                    dataType: 'jsonp',
                    data: data,
                    success: function(res) {
                        if (res.status === 'ok') {
                            endpoint.res = res;
                            endpoint.finished = true;
                            for (var i = 0, len = endpoint.callbacks.success.length; i < len; i++) {
                                endpoint.callbacks.success[i](res);
                            }
                        } else {
                            endpoint.res = res;
                            endpoint.started = false; // don't cache errors?
                            for (var i = 0, len = endpoint.callbacks.error.length; i < len; i++) {
                                endpoint.callbacks.error[i](res);
                            }
                        }
                    }
                });
            } else if (endpoint.started && !endpoint.finished) {
                endpoint.callbacks.success.push(success);
                endpoint.callbacks.error.push(failure);
            } else {
                success(endpoint.res);
            }
        }
    }

    /**
     * SDK functions
     */
    function setAjaxLib(lib, options) {
        ajax = lib;
    }

    function throwDomainError(){
        throw new Error("Cannot access Guardian user data from this domain");
    }

    function isLoggedIn() {
        return !!localUserData();
    }

    function showLoginIfNotLoggedIn(domFramework) {
        if(isLoggedIn()) { return localUserData(); }
        loginOverlay.init(domFramework); // optional dom framework for overlay's init
        loginOverlay.open();
        return false;
    }

    /**
     * Get the local user data out of the identity cookie if available.
     */
    function localUserData() {
        var cookieParts = document.cookie.split('; '),
            i, value, data;
        for (i=cookieParts.length-1; i>= 0; i--) {
            var cookie = cookieParts[i],
                name = cookie.split("=")[0];
            if (name === cookies.user) {
                value = cookie.slice(cookie.indexOf("=") + 1);
                try {
                    data = extractData(value);
                    return {
                        id: data[0],
                        primaryEmailAddress: data[1],
                        publicFields: { displayName: data[2] },
                        userGroups: extractPolicies(data[3]),
                        rawResponse: value
                    };
                } catch (err) {
                    throw new Error("Invalid cookie data");
                }
            }
        }
        return false;
    }
    function extractPolicies(bitmask) {
        var found = [],
            i;
        for (i = policies.length - 1; i >= 0; i--) {
            if (Math.pow(2, i) & bitmask) {
                found.push(policies[i]);
            }
        }
        return found;
    }
    /**
     * Returns the data associated with this encoded string. The data may come from a cookie, or an API call.
     *
     * The general form of the response is:
     * {
     *     field: "value", // etc
     *     rawResponse: "<base64 encoded data>.<signature>"
     * }
     *
     * The encoded data in the raw response can be validated using the signature and identity's public key.
     */
    function extractData(rawResponse) {
        var responseParts = rawResponse.split("."),
            rawData = responseParts[0];
        return JSON.parse(decodeBase64(rawData));
    }

    /*
     * UI
     */
    var loginOverlay = (function(){
        var visible = false,
            options = {
                animate: true,
                animationTime: 200,
                ajaxTimeout: 2000,
                height: '380px',
                width: '620px'
            },
            isLtIE9 = (function()
            {
                var div = document.createElement('div');
                div.innerHTML = '<!--[if lt IE 9]><i></i><![endif]-->';
                return (div.getElementsByTagName('i').length === 1);
            }()),
            blackout, overlay, jQ;

        var closeOverlayCallback = function(e) {
            if (27 === e.keyCode) { close(); }
        };

        /**
         * Close the overlay and remove any contents.
         */
        var close = function() {
            if (visible) {
                if (options.animate) {
                    blackout.fadeOut(options.animationTime);
                    overlay.fadeOut(options.animationTime, function() {
                        jQ(this).find('.identity-overlay-inner').empty();
                    });
                }
                else {
                    blackout.hide();
                    overlay.hide().empty();
                }

                jQ(window).unbind("keyup", closeOverlayCallback);
                jQ(window).trigger('identity.overlay.closed');
            }
            visible = false;
        };

        /**
         * Show the identity login overlay
         */
        var open = function(returnUrl, targetHref) {
            returnUrl = encodeURIComponent(returnUrl || document.location.href);
            var href = (targetHref || urls.web + "/signin?minimal=true&returnUrl=" + returnUrl);
            overlay.find('.identity-overlay-inner').html('<iframe height="100%" width="100%" src="' + href + '"></iframe>');
            if (options.animate) {
                blackout.fadeIn(options.animationTime);
                overlay.fadeIn(options.animationTime);
            }
            else {
                blackout.show();
                overlay.show();
            }
            overlay.css({ 'margin-left': -(overlay.width() / 2) });

            jQ(window).bind("keyup", closeOverlayCallback);
            jQ(window).trigger('identity.overlay.launched');
            visible = true;
        };

        /**
         * Creates the unpopulated overlay elements in the DOM ready for use.
         */
        var createOverlay = function() {
            if (!blackout) {
                blackout = jQ('<div class="identity-overlay-blackout" />')
                        .attr('tabindex', -1)
                        .click(close);
                if(isLtIE9) {
                    blackout.addClass("lt-ie9");
                }
                jQ('body').prepend(blackout);
            }

            if (!overlay) {
                overlay = jQ('<div class="identity-overlay" />');

                var closeElem = jQ('<span class="identity-overlay-close">Close</span>')
                        .click(close);

                overlay
                        .append(closeElem)
                        .append('<div class="identity-overlay-inner" />')
                        .height(options.height)
                        .width(options.width)
                        .appendTo(jQ('body'));
            }

            jQ(window).trigger('identity.overlay.created');
        };

        /**
         * Set up the dom framework
         */
        var init = function(domFramework){
            if (domFramework === undefined) {
                // check for supported DOM frameworks
                if (typeof window.jQuery === "function") {
                    jQ = jQuery;
                } else if (typeof window.Zepto === "function") {
                    (function(zepto){
                        zepto.extend(zepto.fn, {
                            fadeIn: function(duration, complete){
                                complete = complete || empty;
                                this.css({"opacity": 0}).show();
                                return this.animate({'opacity': 1}, duration, complete);
                            },
                            fadeOut: function(duration, complete){
                                complete = complete || empty;
                                return this.animate({'opacity': 0}, duration, function(){
                                    this.hide();
                                    complete.apply(this, arguments);
                                });
                            }
                        });
                    }(window.Zepto));
                    jQ = window.Zepto;
                } else {
                    throw new Error("No DOM framework detected");
                }
            } else {
                jQ = domFramework;
            }
                jQ('<style>.identity-overlay-blackout {\n    background-color: rgba(0,0,0,.6);\n    cursor: pointer;\n    display: none;\n    position: fixed;\n    top: 0; right: 0; bottom: 0; left: 0;\n    z-index: 2001;\n}\n\n.identity-overlay {\n    background-color: #fff;\n    -webkit-box-shadow: 0 0 20px rgba(0,0,0,.5);\n    -moz-box-shadow: 0 0 20px rgba(0,0,0,.5);\n    box-shadow: 0 0 20px rgba(0,0,0,.5);\n    display: none;\n    overflow: hidden;\n    position: fixed;\n    left: 50%; top: 100px;\n    z-index: 2002;\n}\n\n.identity-overlay-inner {\n    height: 100%;\n}\n\n.identity-overlay-close {\n    background: transparent url(http:\/\/id.guim.co.uk\/static\/251\/cs\/images\/close.png) top left no-repeat;\n    cursor: pointer;\n    display: block;\n    height: 32px;\n    overflow: hidden;\n    position: absolute;\n    top: 0; right: 0;\n    text-indent: 100%;\n    white-space: nowrap;\n    width: 32px;\n}\n\n.identity-overlay iframe {\n    border: 0;\n}\n\n.identity-overlay-blackout.lt-ie9 {\n    background: transparent;\n    -ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000,endColorstr=#99000000)\";\n    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000,endColorstr=#99000000);\n    zoom: 1;\n}</style>').appendTo('head');
            createOverlay();
        };

        return {
            init: init,
            open: function(returnUrl, targetHref){
                init();
                open(returnUrl, targetHref);
            },
            close: function(){
                init();
                close();
            }
        };
    }());

    /*
     * Utility functions
     */
    // based on https://github.com/davidchambers/Base64.js/blob/master/base64.js
    var atob = window.atob || (function(){
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
            INVALID_CHARACTER_ERR = (function () {
                // fabricate a suitable error object
                try { document.createElement('$'); }
                catch (error) { return error; }
            }());
        return function (input) {
            input = input.replace(/[=]+$/, '');
            if (input.length % 4 === 1) throw INVALID_CHARACTER_ERR;
            for (
                // initialize result and counters
                    var bc = 0, bs, buffer, idx = 0, output = '';
                // get next character
                    buffer = input.charAt(idx++);
                // character found in table? initialize bit storage and add its ascii value;
                    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                        // and if not first of each 4 characters,
                        // convert the first 8 bits to one ascii character
                            bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
                    ) {
                // try to find character in table (0-63, not found => -1)
                buffer = chars.indexOf(buffer);
            }
            return output;
        };
    })();

    /**
     * Wraps the built-in (or fallback) atob to handle unicode chars correctly
     */
    function decodeBase64(str) {
        // note that this is a valid use of escape, since we don't mean to do HTML escaping
        return decodeURIComponent(escape(atob( str.replace(/-/g, "+").replace(/_/g, "/").replace(/,/g, "=") )));
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function serialize(obj, prefix) {
        var str = [];
        for(var p in obj) {
            var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
            str.push(typeof v == "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
        return str.join("&");
    }

    sdk = {
        api: api,
        setAjaxLib: setAjaxLib,
        validDomain: true,
        isLoggedIn: isLoggedIn,
        loginOverlay: loginOverlay,
        localUserData: localUserData,
        showLoginIfNotLoggedIn: showLoginIfNotLoggedIn
    }
    return sdk;
}));