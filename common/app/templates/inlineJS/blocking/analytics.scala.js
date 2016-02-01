@()
@import conf.Static
@import org.joda.time.DateTime

try {

    (function(){

        var config  = guardian.config,
            isEmbed = !!guardian.isEmbed,
            tpA     = s.getTimeParting('n', '+0'),
            now     = new Date(),
            webPublicationDate = config.page.webPublicationDate,
            w       = window,
            Storage = function (type) {
                this.type = type;
            },
            storage.local = new Storage('localStorage'),
            storage.session = new Storage('sessionStorage')
            isAvailable;

        var R2_STORAGE_KEY = 's_ni', // DO NOT CHANGE THIS, ITS IS SHARED WITH R2. BAD THINGS WILL HAPPEN!
            NG_STORAGE_KEY = 'gu.analytics.referrerVars',
            standardProps = 'channel,prop1,prop2,prop3,prop4,prop8,prop9,prop10,prop13,prop25,prop31,prop37,prop38,prop47,' +
            'prop51,prop61,prop64,prop65,prop74,prop40,prop63,eVar7,eVar37,eVar38,eVar39,eVar50,eVar24,eVar60,eVar51,' +
            'eVar31,eVar18,eVar32,eVar40,list1,list2,list3,events';


        var getChannel = function () {
            if (config.page.contentType === 'Network Front') {
                return 'Network Front';
            } else if (isEmbed) {
                return 'Embedded';
            }
            return config.page.section || '';
        };

        @* http://www.electrictoolbox.com/pad-number-zeroes-javascript/ *@
        var pad = function (number, length) {
            var str = '' + number;
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        };

        s.trackingServer = 'hits.theguardian.com';
        s.trackingServerSecure = 'hits-secure.theguardian.com';

        /* Omniture library version */
        s.prop62    = 'Guardian JS-1.4.1 20140914';

        // http://www.scribd.com/doc/42029685/15/cookieDomainPeriods
        s.cookieDomainPeriods = '2';

        s.linkInternalFilters += ',localhost,gucode.co.uk,gucode.com,guardiannews.com,int.gnl,proxylocal.com,theguardian.com';

        s.ce = 'UTF-8';
        s.pageName  = config.page.analyticsName;

        s.prop1     = config.page.headline || '';

        s.prop3     = config.page.publication || '';

        s.prop6     = config.page.author || '';

        s.prop13    = config.page.series || '';

        // getting clientWidth causes a reflow, so avoid using if possible
        s.eVar21    = (window.innerWidth || document.documentElement.clientWidth)
            + 'x'
            + (window.innerHeight || document.documentElement.clientHeight);


        s.prop4     = config.page.keywords || '';
        s.prop8     = config.page.pageCode || '';
        s.prop9     = config.page.contentType || '';
        s.prop10    = config.page.tones || '';

        s.prop25    = config.page.blogs || '';

        s.channel   = getChannel();

        if (isEmbed) {
            s.eVar11 = s.prop11 = 'Embedded';

            // Get iframe's parent url: http://www.nczonline.net/blog/2013/04/16/getting-the-url-of-an-iframes-parent
            if (!!window.parent && window.parent !== window) {
                s.referrer = document.referrer;
            }
        }

        if (config.page.commentable) {
            s.events = s.apl(s.events, 'event46', ',');
        }

        if (config.page.section === 'identity')  {
            s.prop11 = 'Users';
            s.prop9 = 'userid';
            s.eVar27 = config.page.omnitureErrorMessage || '';
            s.eVar42 = config.page.returnUrl || '';
            s.hier2 = 'GU/Users/Registration';
            s.events = s.apl(s.events, config.page.omnitureEvent, ',');
        }

        // not all pages have a production office
        if (config.page.productionOffice) {
            s.prop64 = config.page.productionOffice;
        }

        s.prop65    = config.page.headline || '';
        s.eVar70    = config.page.headline || '';

        if (s.getParamValue('INTCMP') !== '') {
            s.eVar50 = s.getParamValue('INTCMP');
        }
        s.eVar50 = s.getValOnce(s.eVar50, 's_intcampaign', 0);

        // the operating system
        s.eVar58 = navigator.platform || 'unknown';

        // the number of Guardian links inside the body
        if (config.page.inBodyInternalLinkCount) {
            s.prop58 = config.page.inBodyInternalLinkCount;
        }

        // the number of External links inside the body
        if (config.page.inBodyExternalLinkCount) {
            s.prop69 = config.page.inBodyExternalLinkCount;
        }

        s.prop75 = config.page.wordCount || 0;
        s.eVar75 = config.page.wordCount || 0;

        s.prop19 = 'frontend';
        s.prop67    = 'nextgen-served';

        // Set Page View Event
        s.events    = s.apl(s.events, 'event4', ',', 2);

        s.prop56    = guardian.isModernBrowser ? 'Javascript' : 'Partial Javascript';

        /* Set Time Parting Day and Hour Combination - 0 = GMT */
        s.prop20    = tpA[2] + ':' + tpA[1];
        s.eVar20    = 'D=c20';

        /*
          eVar1 contains today's date
          in the Omniture backend it only ever holds the first
          value a user gets, so in effect it is the first time
          we saw this user
        */
        s.eVar1 = now.getFullYear() + '/' + pad(now.getMonth() + 1, 2) + '/' + pad(now.getDate(), 2);

        s.prop7     = webPublicationDate ? new Date(webPublicationDate).toISOString().substr(0, 10).replace(/-/g, '/') : '';

        if (webPublicationDate) {
            s.prop30 = 'content';
        } else {
            s.prop30 = 'non-content';
        }

        s.prop47    = config.page.edition || '';

        /* Retrieve navigation interaction data */
        var ni   = storage.session.get(NG_STORAGE_KEY)
        //var mvt      = makeOmnitureTag(document);

        if (getUserFromCookie()) {
            s.prop2 = 'GUID:' + getUserFromCookie().id;
            s.eVar2 = 'GUID:' + getUserFromCookie().id;
        }

        s.prop31    = getUserFromCookie() ? 'registered user' : 'guest user';
        s.eVar31    = getUserFromCookie() ? 'registered user' : 'guest user';
        /* can this go ?? */
        //s.prop40    = detect.adblockInUse() || detect.getFirefoxAdblockPlusInstalled();
        /* ok this is going to be a pain */
        //s.eVar51    = mvt;
        //s.list1     = mvt; // allows us to 'unstack' the AB test names (allows longer names)

        if (ni) {
            d = new Date().getTime();
            if (d - ni.time < 60 * 1000) { // One minute
                this.s.eVar24 = ni.pageName;
                this.s.eVar37 = ni.tag;
            }
            storage.session.remove(R2_STORAGE_KEY);
            storage.session.remove(NG_STORAGE_KEY);
        }

        // Sponsored content
        s.prop38 = forEach(document.querySelectorAll('[data-sponsorship]')){function (n) {
            var sponsorshipType = n.getAttribute('data-sponsorship');
            var maybeSponsor = n.getAttribute('data-sponsor');
            var sponsor = maybeSponsor ? maybeSponsor : 'unknown';
            return sponsorshipType + ':' + sponsor;
        }).toString();

        s.linkTrackVars = standardProps;
        s.linkTrackEvents = 'None';

        /*
            this makes the call to Omniture.
            `s.t()` records a page view so should only be called once
        */

        s.t();

        // function makeOmnitureTag() {

        //     function getParticipations() {
        //        return getLocalStorageItem(participationsKey) || {};
        //     }

        //     function getTest(id) {
        //         var test = filter(TESTS, function (test) {
        //             return (test.id === id);
        //         });
        //         return (test) ? test[0] : '';
        //     }

        //     function testCanBeRun(test) {
        //         var expired = (new Date() - new Date(test.expiry)) > 0,
        //             isSensitive = config.page.shouldHideAdverts;
        //         return ((isSensitive ? test.showForSensitive : true)
        //                 && test.canRun() && !expired && isTestSwitchedOn(test));
        //     }

        //     var participations = getParticipations(),
        //         tag = [];

        //     forEach(keys(participations), function (k) {
        //         if (testCanBeRun(getTest(k))) {
        //             tag.push(['AB', k, participations[k].variant].join(' | '));
        //         }
        //     });

        //     forEach(keys(config.tests), function (k) {
        //         if (k.toLowerCase().match(/^cm/)) {
        //             tag.push(['AB', k, 'variant'].join(' | '));
        //         }
        //     });

        //     forEach(getServerSideTests(), function (testName) {
        //         tag.push('AB | ' + testName + ' | inTest');
        //     });

        //     return tag.join(',');
        // }

        var getUserFromCookie = function() {
            var cookieName = 'GU_U';
            var cookieData = cookies.get(cookieName),
            userData = cookieData ? JSON.parse(decodeBase64(cookieData.split('.')[0])) : null;
            if (userData) {
                userFromCookieCache = {
                    id: userData[0],
                    primaryEmailAddress: userData[1], // not sure where this is stored now - not in the cookie any more
                    displayName: userData[2],
                    accountCreatedDate: userData[6],
                    emailVerified: userData[7],
                    rawResponse: cookieData
                };
            }
            return userFromCookieCache
        }

        var decodeBase64 = function (str) {
            return decodeURIComponent(escape(utilAtob(str.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '='))));
        };

        Storage.prototype.isAvailable = function (data) {
            var testKey = 'local-storage-module-test',
                d = data || 'test';
            try {
                // to fully test, need to set item
                // http://stackoverflow.com/questions/9077101/iphone-localstorage-quota-exceeded-err-issue#answer-12976988
                w[this.type].setItem(testKey, d);
                w[this.type].removeItem(testKey);
                return true;
            } catch (e) {
                return false;
            }
        };

        Storage.prototype.isStorageAvailable = function (refresh) {
            if (isAvailable === void 0 || refresh) {
                isAvailable = this.isAvailable();
            }
            return isAvailable;
        };

        Storage.prototype.get = function (key) {
            if (this.isStorageAvailable()) {
                var data,
                    dataParsed;
                if (!w[this.type]) {
                    return;
                }
                data = w[this.type].getItem(key);
                if (data === null) {
                    return null;
                }

                // try and parse the data
                try {
                    dataParsed = JSON.parse(data);
                } catch (e) {
                    // remove the key
                    this.remove(key);
                    return null;
                }

                // has it expired?
                if (dataParsed.expires && new Date() > new Date(dataParsed.expires)) {
                    this.remove(key);
                    return null;
                }

                return dataParsed.value;
            }
        };

        Storage.prototype.getKey = function (i) {
            if (this.isStorageAvailable()) {
                return w[this.type].key(i);
            }
        };


        var checkForPageViewInterval = setInterval(function () {
            @*
                s_i_guardiangu-network is a globally defined Image() object created by Omniture
                It does not sit in the DOM tree, and seems to be the only surefire way
                to check if the intial beacon has been successfully sent
            *@
            var img = window['s_i_' + window.s_account.split(',').join('_')];
            if (typeof (img) !== 'undefined' && (img.complete === true || img.width + img.height > 0)) {
                clearInterval(checkForPageViewInterval);

                var pageView = new Image();
                pageView.src = "@{Configuration.debug.beaconUrl}/count/pva.gif";
            }
        }, 100);

        // Give up after 10 seconds
        setTimeout(function () {
            clearInterval(checkForPageViewInterval);
        }, 10000);


    })();

} catch(e) {
    (new Image()).src = '@{Configuration.debug.beaconUrl}/count/omniture-pageview-error.gif';
}


