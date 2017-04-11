// @flow
const getShortDomain = (): string => {
    // Trim subdomains for prod (www.theguardian), code (m.code.dev-theguardian) and dev (dev.theguardian, m.thegulocal)
    const domain = document.domain || '';
    return domain.replace(/^(www|m\.code|dev|m)\./, '.');
};

const getDomainAttribute = (): string => {
    const shortDomain = getShortDomain();
    return shortDomain === 'localhost' ? '' : ` domain=${shortDomain};`;
};

const remove = (name: string, currentDomainOnly: boolean = false): void => {
    // Remove cookie, implicitly using the document's domain.
    document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    if (!currentDomainOnly) {
        // also remove from the short domain
        document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${getShortDomain()};`;
    }
};

const add = (name: string, value: string, daysToLive: ?number): void => {
    const expires = new Date();

    if (daysToLive) {
        expires.setDate(expires.getDate() + daysToLive);
    } else {
        expires.setMonth(expires.getMonth() + 5);
        expires.setDate(1);
    }

    document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()};${getDomainAttribute()}`;
};

const cleanUp = (names: Array<string>): void => {
    names.forEach(name => {
        remove(name);
    });
};

const addForMinutes = (
    name: string,
    value: string,
    minutesToLive: number
): void => {
    if (minutesToLive) {
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + minutesToLive);
        document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()};${getDomainAttribute()}`;
    } else {
        add(name, value);
    }
};

const addSessionCookie = (name: string, value: string): void => {
    document.cookie = `${name}=${value}; path=/;${getDomainAttribute()}`;
};

const getCookieValues = (name: string): Array<?string> => {
    const cookieVals = [];
    const nameEq = `${name}=`;
    const cookies = document.cookie.split(';');

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
};

const get = (name: string): ?string => {
    const cookieVal = getCookieValues(name);

    if (cookieVal.length > 0) {
        return cookieVal[0];
    }
    return null;
};

export { cleanUp, add, addSessionCookie, addForMinutes, remove, get };
