define([
    'lodash/collections/forEach'
], function (
    forEach
) {

    var documentObject;

    function getShortDomain() {
        // Remove www (and dev bit, for localhost set up with dev.theguardian.com domain)
        return document.domain.replace(/^(www|dev)\./, '.');
    }

    function cleanUp(names) {
        forEach(names, function (name) {
            remove(name);
        });
    }

    function cleanUpDuplicates(names) {

        // Do not clean if there is no difference from the target domain (the domain we want to store our cookies on).
        if (getShortDomain() === document.domain) {
            return;
        }

        forEach(names, function (name) {
            if (getCookieValues(name).length > 1) {
                // This remove is conservative; we know it is safe to remove the cookie with the document domain.
                remove(name, true);
            }
        });
    }

    function remove(name, currentDomainOnly) {
        // Remove cookie, implicitly using the document's domain.
        _document().cookie = name + '=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        if (!currentDomainOnly) {
            // also remove from the short domain
            _document().cookie =
                name + '=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=' + getShortDomain() + ';';
        }
    }

    function add(name, value, daysToLive) {

        var expires = new Date();

        if (daysToLive) {
            expires.setDate(expires.getDate() + daysToLive);
        } else {
            expires.setMonth(expires.getMonth() + 5);
            expires.setDate(1);
        }

        _document().cookie =
            name + '=' + value + '; path=/; expires=' + expires.toUTCString() + '; domain=' + getShortDomain() + ';';
    }

    function addForMinutes(name, value, minutesToLive) {
        if (minutesToLive) {
            var expires = new Date();
            expires.setMinutes(expires.getMinutes() + minutesToLive);
            _document().cookie =
                name + '=' + value + '; path=/; expires=' + expires.toUTCString() + '; domain=' + getShortDomain() + ';';
        } else {
            add(name, value);
        }
    }

    function addSessionCookie(name, value) {
        _document().cookie = name + '=' + value + '; path=/; domain=' + getShortDomain() + ';';
    }

    function getCookieValues(name) {
        var cookieVals = [],
            nameEq = name + '=',
            cookies = _document().cookie.split(';');

        forEach(cookies, function (cookie) {
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }

            if (cookie.indexOf(nameEq) === 0) {
                cookieVals.push(cookie.substring(nameEq.length, cookie.length));
            }
        });

        return cookieVals;
    }

    function get(name) {
        var cookieVal = getCookieValues(name);

        if (cookieVal.length > 0) {
            return cookieVal[0];
        } else {
            return null;
        }
    }

    function _setDocument(d) {
        documentObject = d;
    }

    function _document() {
        return (documentObject || document);
    }

    return {
        cleanUp: cleanUp,
        cleanUpDuplicates: cleanUpDuplicates,
        add: add,
        addSessionCookie: addSessionCookie,
        addForMinutes: addForMinutes,
        remove: remove,
        get: get,
        _setDocument: _setDocument
    };

});
