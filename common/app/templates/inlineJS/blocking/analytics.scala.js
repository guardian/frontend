@()
@import conf.Static
@import org.joda.time.DateTime

try {

    (function(){

        var config  = guardian.config,
            isEmbed = !!guardian.isEmbed,
            tpA     = s.getTimeParting('n', '+0'),
            now      = new Date(),
            webPublicationDate = config.page.webPublicationDate;

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

        var participationsKey = 'gu.ab.participations';

        try {
            var participations = window.localStorage.getItem(participationsKey);

            var abTestsParticipations = makeOmnitureABTag(participations);

            s.eVar51    = abTestsParticipations;
            s.list1     = abTestsParticipations;

            // This is set globally so we can check if the use ab test participations change once the ab test runs.
            // If it does, we fire a second tracking call in modules/analytics/omniture.js
            guardian.config.abTestsParticipations = abTestsParticipations;
        } catch (e) { }

        function makeOmnitureABTag(currentParticipations) {
            var participations = JSON.parse(currentParticipations);
            var tag = [];

            for (var key in participations.value) {
                tag.push(['AB', key, participations.value[key].variant].join(' | '));
            }

            for (var key in config.tests) {
                if (key.toLowerCase().match(/^cm/)) {
                    tag.push(['AB', key, 'variant'].join(' | '));
                }
                //only collect serverside tests the user is participating in
                if(!!config.tests[key]){
                    tag.push('AB | ' + key + ' | inTest');
                }
            };

            return tag.join(',');
        }


        @*
          eVar1 contains today's date
          in the Omniture backend it only ever holds the first
          value a user gets, so in effect it is the first time
          we saw this user
        *@
        s.eVar1 = now.getFullYear() + '/' + pad(now.getMonth() + 1, 2) + '/' + pad(now.getDate(), 2);

        s.prop7     = webPublicationDate ? new Date(webPublicationDate).toISOString().substr(0, 10).replace(/-/g, '/') : '';

        if (webPublicationDate) {
            s.prop30 = 'content';
        } else {
            s.prop30 = 'non-content';
        }

        s.prop47    = config.page.edition || '';

        @*
            this makes the call to Omniture.
            `s.t()` records a page view so should only be called once
        *@

        s.t();


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


