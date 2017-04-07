define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'commercial/modules/dfp/get-creative-ids',
    'common/modules/experiments/ab',
    'lodash/collections/map',
    'lodash/collections/reduce',
    'lodash/objects/assign',
    'lodash/objects/keys',
    'common/utils/cookies'
], function (
    bean,
    fastdom,
    $,
    config,
    detect,
    getCreativeIDs,
    ab,
    map,
    reduce,
    assign,
    keys,
    cookies
) {

    console.log("feedbacking started")

    var adblockBeingUsed = false;

    function objToString(obj) {
        return reduce(obj, function (str, value, key) {
            return str + key + ': ' + value + '\n';
        }, '');
    }

    function objToHash(obj) {
        return reduce(obj, function (str, value, key) {
            return str + '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
        }, '');
    }

    function addEmailValuesToHash(storedValues) {
        return function (link) {
            return function () {
                var oldHref = link.attr('href');
                var props = {
                    page: window.location,
                    width: window.innerWidth,
                    ads: getCreativeIDs().join(' ')
                };
                var body = objToHash(assign(props, storedValues));
                link.attr('href', oldHref + '#' + body.substring(1));
            };
        };
    }

    function getExtraDataInformation() {
        return {
            browser: window.navigator.userAgent,
            page: window.location,
            width: window.innerWidth,
            adBlock: adblockBeingUsed,
            devicePixelRatio: window.devicePixelRatio,
            ophanId: config.ophan.pageViewId,
            gu_u: cookies.get('GU_U'),
            payingMember: cookies.get('gu_paying_member'),
            abTests : summariseAbTests(ab.getParticipations())
        };
    }

    function addEmailHeaders(storedValues) {
        return function (link) {
            return function () {
                var oldHref = link.attr('href');
                var props = getExtraDataInformation();
                var body = '\r\n\r\n\r\n\r\n------------------------------\r\nAdditional technical data about your request - please do not edit:\r\n\r\n'
                    + objToString(assign(props, storedValues))
                    + '\r\n\r\n';
                link.attr('href', oldHref + '?body=' + encodeURIComponent(body));
            };
        };
    }

    function registerHandler(selector, addEmailHeaders) {
        var link = $(selector);

        if (link.length) {
            for (var i=0; i < link.length; ++i)
                bean.on(link[i], 'click', addEmailHeaders(link));
        }
    }

    function getValuesFromHash(hash) {
        var pairs = hash.substring(1).split('&');
        return reduce(pairs, function (accu, pairJoined) {
            var pair = pairJoined.split('='),
                object = {};
            if (!!pair[0] && !!pair[1]) {
                object[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
                return assign(accu, object);
            } else {
                return accu;
            }
        }, {});
    }

    function summariseAbTests(testParticipations) {
        var tests = keys(testParticipations);
        if (tests.length === 0) {
            return 'No tests running';
        } else {
            return map(tests, function (testKey) {
                var test = testParticipations[testKey];
                return testKey + '=' + test.variant;
            }).join(', ');
        }
    }

    /**
     * the link in the footer adds some of the values to the hash so feedback can use it later.  Those values
     * override those at the time the email is sent.
     */
    return function () {
        detect.adblockInUse.then(function(adblockInUse){
            adblockBeingUsed = adblockInUse;
        });

        var storedValues = getValuesFromHash(window.location.hash);
        registerHandler('.js-tech-feedback-report', addEmailValuesToHash(storedValues));
        registerHandler('.js-tech-feedback-mailto', addEmailHeaders(storedValues));
        registerHandler('[href=mailto:userhelp@theguardian.com]', addEmailHeaders(storedValues));
        registerHandler('[href=mailto:crosswords.beta@theguardian.com]', addEmailHeaders(storedValues));// FIXME should have used a .js- selector

        // Exposed for testing
        this.getValuesFromHash = getValuesFromHash;
        this.summariseAbTests = summariseAbTests;

        document.getElementById("oingoboingo").innerHTML = "BLOODY WORKED";

        console.log("I CAN'T STOP THIS FEELING. DEEP INSIDE MYSELF. GIRL YOU JUST DON'T REALISE");
    };
});
