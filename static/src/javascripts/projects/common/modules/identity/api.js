// @flow

/* global escape:true */
import { ajax } from 'lib/ajax';
import config from 'lib/config';
import { getCookie as getCookieByName } from 'lib/cookies';
import mediator from 'lib/mediator';
import { local } from 'lib/storage';
import { mergeCalls } from 'common/modules/asyncCallMerger';

let userFromCookieCache = null;

const Id = {
    cookieName: 'GU_U',
    signOutCookieName: 'GU_SO',
    fbCheckKey: 'gu.id.nextFbCheck',
    lastRefreshKey: 'identity.lastRefresh',
    idApiRoot: null,
};

export const init = () => {
    Id.idApiRoot = config.page.idApiUrl;
    mediator.emit('module:identity:api:loaded');
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

/**
 * The object returned from the cookie has the keys:
 *
 * {
 *    id
 *    primaryEmailAddress
 *    displayName
 *    accountCreatedDate
 *    emailVerified
 *    rawResponse
 * };
 */
export const getUserFromCookie = (): ?Object => {
    if (userFromCookieCache === null) {
        const cookieData = getCookieByName(Id.cookieName);
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

export const isUserLoggedIn = (): boolean => getUserFromCookie() !== null;

export const getUserFromApi = mergeCalls(mergingCallback => {
    const apiRoot = Id.idApiRoot || '';

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

export const reset = () => {
    getUserFromApi.reset();
    userFromCookieCache = null;
};

export const getCookie = (): ?string => getCookieByName(Id.cookieName);

export const getUrl = (): string => config.page.idUrl;

export const getUserFromApiWithRefreshedCookie = () => {
    const endpoint = '/user/me';
    const request = ajax({
        url: (Id.idApiRoot || '') + endpoint,
        type: 'jsonp',
        data: {
            refreshCookie: true,
        },
    });

    return request;
};

export const redirectTo = (url: string): void => {
    window.location.href = url;
};

export const getUserOrSignIn = (paramUrl: ?string): ?Object => {
    let returnUrl = paramUrl;

    if (isUserLoggedIn()) {
        return getUserFromCookie();
    }

    returnUrl = encodeURIComponent(returnUrl || document.location.href);
    const url = `${getUrl() ? getUrl() : ''}/signin?returnUrl=${returnUrl}`;
    redirectTo(url);
};

export const hasUserSignedOutInTheLast24Hours = (): boolean => {
    const cookieData = getCookieByName(Id.signOutCookieName);

    if (cookieData) {
        return (
            Math.round(new Date().getTime() / 1000) <
            parseInt(cookieData, 10) + 86400
        );
    }
    return false;
};

export const shouldAutoSigninInUser = (): boolean => {
    const signedInUser = !!getCookieByName(Id.cookieName);
    const checkFacebook = !!local.get(Id.fbCheckKey);
    return (
        !signedInUser && !checkFacebook && !hasUserSignedOutInTheLast24Hours()
    );
};

export const emailSignup = (listId: string) => {
    const user = getUserFromCookie();
    if (!user) {
        return;
    }

    const endpoint = `/useremails/${user.id}/subscriptions`;
    const data = {
        listId,
    };
    const request = ajax({
        url: (Id.idApiRoot || '') + endpoint,
        type: 'jsonp',
        crossOrigin: true,
        data: {
            body: JSON.stringify(data),
            method: 'post',
        },
    });

    return request;
};

export const getUserEmailSignUps = (): Promise<any> => {
    const user = getUserFromCookie();

    if (user) {
        const endpoint = `/useremails/${user.id}`;
        const request = ajax({
            url: (Id.idApiRoot || '') + endpoint,
            type: 'jsonp',
            crossOrigin: true,
        });

        return request;
    }

    return Promise.resolve(null);
};

export const sendValidationEmail = () => {
    const endpoint = '/user/send-validation-email';
    const request = ajax({
        url: (Id.idApiRoot || '') + endpoint,
        type: 'jsonp',
        crossOrigin: true,
        data: {
            method: 'post',
        },
    });

    return request;
};

export const updateUsername = (username: string) => {
    const endpoint = '/user/me';
    const data = {
        publicFields: {
            username,
            displayName: username,
        },
    };
    const request = ajax({
        url: (Id.idApiRoot || '') + endpoint,
        type: 'json',
        crossOrigin: true,
        method: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        withCredentials: true,
        headers: {
            'X-GU-ID-Client-Access-Token': `Bearer ${config.page
                .idApiJsClientToken}`,
        },
    });

    return request;
};

export default Id;
