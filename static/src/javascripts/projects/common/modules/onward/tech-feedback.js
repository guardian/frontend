define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/commercial/dfp-api',
    'common/modules/experiments/ab',
    'lodash/collections/map',
    'lodash/collections/reduce',
    'lodash/objects/assign',
    'lodash/objects/pairs'
], function (
    bean,
    fastdom,
    $,
    config,
    detect,
    map,
    dfp,
    ab,
    reduce,
    assign,
    pairs) {

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
                    ads: dfp.getCreativeIDs().join(' '),
                    ophanId: config.ophan.pageViewId
                };
                var body = objToHash(assign(props, storedValues));
                link.attr('href', oldHref + '#' + body.substring(1));
            };
        };
    }

    function addEmailHeaders(storedValues) {
        return function (link) {
            return function () {
                var oldHref = link.attr('href');
                var props = {
                    browser: window.navigator.userAgent,
                    page: window.location,
                    width: window.innerWidth,
                    adBlock: detect.adblockInUse(),
                    devicePixelRatio: window.devicePixelRatio,
                    abTests : summariseAbTests()
                };
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
            bean.on(link[0], 'click', addEmailHeaders(link));
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

    function summariseAbTests() {
        var testAndVariantPairs = pairs(ab.getTestsAndVariants());
        if (testAndVariantPairs.length === 0) {
            return 'No tests running';
        } else {
            return map(testAndVariantPairs, function (pair) {
                return pair[0] + '=' + pair[1];
            }).join(', ');
        }
    }

    /**
     * the link in the footer adds some of the values to the hash so feedback can use it later.  Those values
     * override those at the time the email is sent.
     */
    return function () {
        var storedValues = getValuesFromHash(window.location.hash);
        this.getValuesFromHash = getValuesFromHash;
        registerHandler('.js-tech-feedback-report', addEmailValuesToHash(storedValues));
        registerHandler('.js-tech-feedback-mailto', addEmailHeaders(storedValues));
        registerHandler('.js-userhelp-mailto', addEmailHeaders(storedValues));
        registerHandler('[href=mailto:crosswords.beta@theguardian.com]', addEmailHeaders(storedValues));// FIXME should have used a .js- selector
    };
});
