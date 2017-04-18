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

const removeCookie = (
    name: string,
    currentDomainOnly: boolean = false
): void => {
    const expires = 'expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    const path = 'path=/;';

    // Remove cookie, implicitly using the document's domain.
    document.cookie = `${name}=;${path}${expires}`;
    if (!currentDomainOnly) {
        // also remove from the short domain
        document.cookie = `${name}=;${path}${expires} domain=${getShortDomain()};`;
    }
};

const addCookie = (name: string, value: string, daysToLive: ?number): void => {
    const expires = new Date();

    if (daysToLive) {
        expires.setDate(expires.getDate() + daysToLive);
    } else {
        expires.setMonth(expires.getMonth() + 5);
        expires.setDate(1);
    }

    document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()};${getDomainAttribute()}`;
};

const cleanUp = (names: string[]): void => {
    names.forEach(name => {
        removeCookie(name);
    });
};

const addForMinutes = (
    name: string,
    value: string,
    minutesToLive: number
): void => {
    const expires = new Date();

    expires.setMinutes(expires.getMinutes() + minutesToLive);
    document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()};${getDomainAttribute()}`;
};

const addSessionCookie = (name: string, value: string): void => {
    document.cookie = `${name}=${value}; path=/;${getDomainAttribute()}`;
};

const getCookieValues = (name: string): string[] => {
    const nameEq = `${name}=`;
    const cookies = document.cookie.split(';');

    return cookies.reduce((acc, cookie) => {
        const cookieTrimmed = cookie.trim();

        if (cookieTrimmed.indexOf(nameEq) === 0) {
            acc.push(
                cookieTrimmed.substring(nameEq.length, cookieTrimmed.length)
            );
        }

        return acc;
    }, []);
};

const getCookie = (name: string): ?string => {
    const cookieVal = getCookieValues(name);

    if (cookieVal.length > 0) {
        return cookieVal[0];
    }
    return null;
};

export {
    cleanUp,
    addCookie,
    addSessionCookie,
    addForMinutes,
    removeCookie,
    getCookie,
};
