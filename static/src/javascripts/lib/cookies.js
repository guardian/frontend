// @flow
let documentObject;

function setDocument(d) {
    documentObject = d;
}

function getDocument() {
    return documentObject || document;
}

function getShortDomain() {
    // Trim subdomains for prod (www.theguardian), code (m.code.dev-theguardian) and dev (dev.theguardian, m.thegulocal)
    return getDocument().domain.replace(/^(www|m\.code|dev|m)\./, '.');
}

function getDomainAttribute() {
    const shortDomain = getShortDomain();
    return shortDomain === 'localhost' ? '' : ` domain=${shortDomain};`;
}

function remove(name, currentDomainOnly) {
    // Remove cookie, implicitly using the document's domain.
    getDocument().cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    if (!currentDomainOnly) {
        // also remove from the short domain
        getDocument().cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${getShortDomain()};`;
    }
}

function add(name, value, daysToLive) {
    const expires = new Date();

    if (daysToLive) {
        expires.setDate(expires.getDate() + daysToLive);
    } else {
        expires.setMonth(expires.getMonth() + 5);
        expires.setDate(1);
    }

    getDocument().cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()};${getDomainAttribute()}`;
}

function cleanUp(names) {
    names.forEach(name => {
        remove(name);
    });
}

function addForMinutes(name, value, minutesToLive) {
    if (minutesToLive) {
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + minutesToLive);
        getDocument().cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()};${getDomainAttribute()}`;
    } else {
        add(name, value);
    }
}

function addSessionCookie(name, value) {
    getDocument().cookie = `${name}=${value}; path=/;${getDomainAttribute()}`;
}

function getCookieValues(name) {
    const cookieVals = [];
    const nameEq = `${name}=`;
    const cookies = getDocument().cookie.split(';');

    cookies.forEach(cookie => {
        let cookieN = cookie;

        while (cookieN.charAt(0) === ' ') {
            cookieN = cookieN.substring(1, cookie.length);
        }

        if (cookieN.indexOf(nameEq) === 0) {
            cookieVals.push(cookieN.substring(nameEq.length, cookieN.length));
        }
    });

    return cookieVals;
}

function get(name) {
    const cookieVal = getCookieValues(name);

    if (cookieVal.length > 0) {
        return cookieVal[0];
    }
    return null;
}

export default {
    cleanUp,
    add,
    addSessionCookie,
    addForMinutes,
    remove,
    get,
    test: {
        setDocument,
    },
};
