define([
    'lodash/collections/forEach'
], function (
    forEach
) {

    var documentObject;

    function getShortDomain() {
        // Trim subdomains for prod (www.theguardian), code (m.code.dev-theguardian) and dev (dev.theguardian, m.thegulocal)
        return getDocument().domain.replace(/^(www|m\.code|dev|m)\./, '.');
    }

    function cleanUp(names) {
        forEach(names, function (name) {
            remove(name);
        });
    }

    function remove(name, currentDomainOnly) {
        // Remove cookie, implicitly using the document's domain.
        getDocument().cookie = name + '=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        if (!currentDomainOnly) {
            // also remove from the short domain
            getDocument().cookie =
                name + '=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=' + getShortDomain() + ';';
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

        getDocument().cookie =
            name + '=' + value + '; path=/; expires=' + expires.toUTCString() + ';' + getDomainAttribute();
    }

    function getDomainAttribute() {
        var shortDomain = getShortDomain();
        return (shortDomain === 'localhost') ? '' : (' domain=' + shortDomain + ';');
    }

    function addForMinutes(name, value, minutesToLive) {
        if (minutesToLive) {
            var expires = new Date();
            expires.setMinutes(expires.getMinutes() + minutesToLive);
            getDocument().cookie =
                name + '=' + value + '; path=/; expires=' + expires.toUTCString() + ';' + getDomainAttribute();
        } else {
            add(name, value);
        }
    }

    function addSessionCookie(name, value) {
        getDocument().cookie = name + '=' + value + '; path=/;' + getDomainAttribute();
    }

    function getCookieValues(name) {
        var cookieVals = [],
            nameEq = name + '=',
            cookies = getDocument().cookie.split(';');

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

    function setDocument(d) {
        documentObject = d;
    }

    function getDocument() {
        return (documentObject || document);
    }

    return {
        cleanUp: cleanUp,
        add: add,
        addSessionCookie: addSessionCookie,
        addForMinutes: addForMinutes,
        remove: remove,
        get: get,
        test: {
            setDocument: setDocument
        }
    };

});
