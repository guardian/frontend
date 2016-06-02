@()

(function applyAdfreeRenderCondition(commercial){
    var AD_FREE_COOKIE = 'gu_adfree_test';
    var MVT_ID_COOKIE = 'GU_mvt_id';
    var FIRST_TIME_VISIT_KEY = 'gu.firstVisitTime';
    var ALREADY_VISITED_KEY = 'gu.alreadyVisited';

    if ((readLocalStorage(ALREADY_VISITED_KEY) || 0) == 0) {
        writeLocalStorage(FIRST_TIME_VISIT_KEY, new Date().getTime());
    }

    if (isFirst3VisitDays() && isInVariantGroup()){
        commercial.showingAdfree = true;
        return 'is-adfree';
    } else {
        commercial.showingAdfree = false;
        return '';
    }

    function isFirst3VisitDays() {
        var firstVisit = readLocalStorage(FIRST_TIME_VISIT_KEY) || 0;
        return (new Date().getTime() - firstVisit) < 259200000;
    }

    function isInVariantGroup() {
        var cookie = readCookie(AD_FREE_COOKIE);
        if (cookie == null) {
            assignUser();
        }
        return readCookie(AD_FREE_COOKIE) == "variant";
    }

    function isIOS() {
        return /(iPad|iPhone|iPod touch)/i.test(navigator.userAgent);
    }

    function isSafari() {
        return /(safari)/i.test(navigator.userAgent);
    }

    function assignUser() {
        var mvtNumValues = 899999;
        var audience = 0.1; // keep this in sync with new-user-adverts-disabled.js
        var audienceOffset = 0; // keep this in sync with new-user-adverts-disabled.js
        var smallestTestId = mvtNumValues * audienceOffset;
        var largestTestId  = smallestTestId + mvtNumValues * audience;
        var mvtCookieId = readCookie(MVT_ID_COOKIE);
        var variants;
        var testVariantIndex;

        var alreadyVisited = readLocalStorage('gu.alreadyVisited') || 0;
        if (alreadyVisited == 0
            && mvtCookieId
            && mvtCookieId > smallestTestId
            && mvtCookieId <= largestTestId
            && !isIOS() && !isSafari()) {
            variants = [{
                id: 'variant',
                test: function () {
                    writeCookie(AD_FREE_COOKIE, 'variant');
                }
            }, {
                id: 'control',
                test: function () {
                    writeCookie(AD_FREE_COOKIE, 'control');
                }
            }];
            testVariantIndex = mvtCookieId % variants.length;
            variants[testVariantIndex].test();
        } else {
            writeCookie(AD_FREE_COOKIE, 'notintest');
        }
    }

    function readLocalStorage(key) {
        if ("localStorage" in window) {
            var data;

            try {
                data = localStorage.getItem(key);
                if (data === null) {
                    return null;
                } else {
                    return JSON.parse(data).value;
                }
            } catch (e) {
                return null;
            }
        }
    }

    function writeLocalStorage(key, data) {
        if ("localStorage" in window) {
            try {
                var value = JSON.stringify({
                    value: data
                });
                return localStorage.setItem(key, value);
            } catch (e) {
                return null;
            }
        }
    }

    function readCookie(name) {
        var cookies, i, cookieString, cookieParts;

        cookies = document.cookie.split(';');
        for (i = 0; i < cookies.length; i++) {
            cookieString = cookies[i];
            cookieParts = cookieString.split('=');
            if (cookieParts[0].trim() === name) {
                return cookieParts[1].trim();
            }
        }
        return null;
    }

    function writeCookie(name, value) {
        function getDomainAttribute() {
            var shortDomain = document.domain.replace(/^(www|m\.code|dev|m)\./, '.');
            return (shortDomain === 'localhost') ? '' : (' domain=' + shortDomain + ';');
        }

        var expires = new Date();
        expires.setMonth(expires.getMonth() + 5);
        expires.setDate(1);

        document.cookie =
            name + '=' + value + '; path=/; expires=' + expires.toUTCString() + ';' + getDomainAttribute();
    }

}(window.guardian.config.commercial))
