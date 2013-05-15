define(function() {
    'use strict';
    var sdk,
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
                                    ];

    /**
     * SDK functions
     */

    function isLoggedIn() {
        return !!localUserData();
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
        validDomain: true,
        isLoggedIn: isLoggedIn,
        localUserData: localUserData
    }
    return sdk;
});