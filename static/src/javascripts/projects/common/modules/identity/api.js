// @flow

/* global escape:true */
import { ajax } from 'lib/ajax';
import config from 'lib/config';
import { getCookie as getCookieByName } from 'lib/cookies';
import mediator from 'lib/mediator';
import { local } from 'lib/storage';
import { mergeCalls } from 'common/modules/async-call-merger';
import { getUrlVars } from 'lib/url';
import fetch from 'lib/fetch-json';
import qs from 'qs';
import reqwest from 'reqwest';

let userFromCookieCache = null;

const cookieName = 'GU_U';
const signOutCookieName = 'GU_SO';
const fbCheckKey = 'gu.id.nextFbCheck';
let idApiRoot = null;
let profileRoot = null;

type PasswordCredential = {
    id: string,
    password: string,
};

export type SettableConsent = {
    id: string,
    consented: boolean,
};

export type Newsletter = {
    id: string,
    subscribed: boolean,
};

export type IdentityUser = {
    id: number,
    primaryEmailAddress: string,
    displayName: string,
    accountCreatedDate: string,
    emailVerified: string,
    rawResponse: ?string,
};

export const init = (): void => {
    idApiRoot = config.get('page.idApiUrl');
    mediator.emit('module:identity:api:loaded');
    profileRoot = config.get('page.idUrl');
};

export const decodeBase64 = (str: string): string =>
    decodeURIComponent(
        escape(
            window.atob(
                str
                    .replace(/-/g, '+')
                    .replace(/_/g, '/')
                    .replace(/,/g, '=')
            )
        )
    );

export const getUserFromCookie = (): ?IdentityUser => {
    if (userFromCookieCache === null) {
        const cookieData = getCookieByName(cookieName);
        let userData = null;

        if (cookieData) {
            userData = JSON.parse(decodeBase64(cookieData.split('.')[0]));
        }
        if (userData) {
            const displayName = decodeURIComponent(userData[2]);
            userFromCookieCache = {
                id: userData[0],
                primaryEmailAddress: userData[1], // not sure where this is stored now - not in the cookie any more
                displayName,
                accountCreatedDate: userData[6],
                emailVerified: userData[7],
                rawResponse: cookieData,
            };
        }
    }

    return userFromCookieCache;
};

export const updateNewsletter = (newsletter: Newsletter): Promise<void> =>
    reqwest({
        url: `${config.get('page.idApiUrl')}/users/me/newsletters`,
        method: 'PATCH',
        type: 'json',
        contentType: 'application/json',
        withCredentials: true,
        crossOrigin: true,
        data: JSON.stringify(newsletter),
    });

export const buildNewsletterUpdatePayload = (
    action: string = 'none',
    newsletterId: string
): Newsletter => {
    const newsletter = {};
    switch (action) {
        case 'add':
            newsletter.id = newsletterId;
            newsletter.subscribed = true;
            break;
        case 'remove':
            newsletter.id = newsletterId;
            newsletter.subscribed = false;
            break;
        default:
            throw new Error(`Undefined newsletter action type (${action})`);
    }
    return newsletter;
};

export const isUserLoggedIn = (): boolean => getUserFromCookie() !== null;

export const getUserFromApi = mergeCalls(mergingCallback => {
    const apiRoot = idApiRoot || '';

    if (isUserLoggedIn()) {
        ajax({
            url: `${apiRoot}/user/me`,
            type: 'jsonp',
            crossOrigin: true,
        }).then(response => {
            if (response.status === 'ok') {
                mergingCallback(response.user);
            } else {
                mergingCallback(null);
            }
        });
    } else {
        mergingCallback(null);
    }
});

export const reset = (): void => {
    getUserFromApi.reset();
    userFromCookieCache = null;
};

export const getCookie = (): ?string => getCookieByName(cookieName);

export const getUrl = (): string => config.get('page.idUrl');

export const getUserFromApiWithRefreshedCookie = () => {
    const endpoint = '/user/me';
    const request = ajax({
        url: (idApiRoot || '') + endpoint,
        type: 'jsonp',
        data: {
            refreshCookie: true,
        },
    });

    return request;
};

export const redirectTo = (url: string): void => {
    window.location.assign(url);
};

export const getUserOrSignIn = (paramUrl: ?string): ?Object => {
    let returnUrl = paramUrl;

    if (isUserLoggedIn()) {
        return getUserFromCookie();
    }

    returnUrl = encodeURIComponent(returnUrl || document.location.href);
    const url = `${getUrl() || ''}/signin?returnUrl=${returnUrl}`;
    redirectTo(url);
};

export const hasUserSignedOutInTheLast24Hours = (): boolean => {
    const cookieData = getCookieByName(signOutCookieName);

    if (cookieData) {
        return (
            Math.round(new Date().getTime() / 1000) <
            parseInt(cookieData, 10) + 86400
        );
    }
    return false;
};

export const shouldAutoSigninInUser = (): boolean => {
    const signedInUser = !!getCookieByName(cookieName);
    const checkFacebook = !!local.get(fbCheckKey);
    return (
        !signedInUser && !checkFacebook && !hasUserSignedOutInTheLast24Hours()
    );
};

export const getUserEmailSignUps = (): Promise<any> => {
    const user = getUserFromCookie();

    if (user) {
        const endpoint = `/useremails/${user.id}`;
        const request = ajax({
            url: (idApiRoot || '') + endpoint,
            type: 'jsonp',
            crossOrigin: true,
            withCredentials: true,
        });

        return request;
    }

    return Promise.resolve(null);
};

export const sendValidationEmail = (): any => {
    const defaultReturnEndpoint = '/email-prefs';
    const endpoint = '/user/send-validation-email';
    const returnUrl = getUrlVars().returnUrl
        ? decodeURIComponent(getUrlVars().returnUrl)
        : (profileRoot || '') + defaultReturnEndpoint;

    const request = ajax({
        url: (idApiRoot || '') + endpoint,
        type: 'jsonp',
        crossOrigin: true,
        data: {
            method: 'post',
            returnUrl,
        },
    });

    return request;
};

export const updateUsername = (username: string): any => {
    const endpoint = '/user/me';
    const data = {
        publicFields: {
            username,
            displayName: username,
        },
    };
    const request = ajax({
        url: (idApiRoot || '') + endpoint,
        type: 'json',
        crossOrigin: true,
        method: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        withCredentials: true,
    });

    return request;
};

export const getAllConsents = () => {
    const endpoint = '/consents';
    const url = (idApiRoot || '') + endpoint;
    return fetch(url, {
        mode: 'cors',
        method: 'GET',
        headers: { Accept: 'application/json' },
    });
};

export const getAllNewsletters = () => {
    const endpoint = '/newsletters';
    const url = (idApiRoot || '') + endpoint;
    return fetch(url, {
        mode: 'cors',
        method: 'GET',
        headers: { Accept: 'application/json' },
    });
};

export const getSubscribedNewsletters = () => {
    const endpoint = '/users/me/newsletters';
    const url = (idApiRoot || '') + endpoint;
    return fetch(url, {
        mode: 'cors',
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
    })
        .then(json => {
            if (json.result.subscriptions) {
                return json.result.subscriptions.map(sub => sub.listId);
            }
            return [];
        })
        .catch(() => []);
};

export const setConsent = (consents: SettableConsent[]): Promise<void> =>
    new Promise((success, error) => {
        reqwest({
            url: `${idApiRoot || ''}/users/me/consents`,
            method: 'PATCH',
            type: 'json',
            contentType: 'application/json',
            withCredentials: true,
            crossOrigin: true,
            data: JSON.stringify(consents),
            error,
            success,
        });
    });
export const ajaxSignIn = (credentials: PasswordCredential) => {
    const url = `${profileRoot || ''}/actions/auth/ajax`;
    return fetch(url, {
        mode: 'cors',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: qs.stringify({
            email: credentials.id,
            password: credentials.password,
        }),
        credentials: 'include',
    });
};

export const getUserData = (): Promise<Response> =>
    fetch(`${idApiRoot || ''}/user/me`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
    });
