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

    console.log("feedback js running");

    var select = document.getElementById("feedback-category");

    var fieldmap = {
        "Help with my Guardian account": "feedback-form-account",
        "Report a problem/give feedback on your website": "feedback-form-website",
        "Unsubscribe from Jobs alerts/have other issues with my jobs account": "feedback-form-jobs",
        "Manage my email preferences": "feedback-form-email",
        "Report a Memberships/subscriptions technical issue or give some feedback": "feedback-form-membership",
        "Membership payment or billing issues": "feedback-form-membership-billing",
        "Subscriptions payment, billing or fulfillment issues": "feedback-form-subs-billing",
        "Feedback about Adverts on your website/apps": "feedback-form-adverts",
        "Help with my Android news app": "feedback-form-android",
        "Help with my iOS news app": "feedback-form-ios",
        "Help with the daily edition on my iPad": "feedback-form-daily",
        "Help with the daily edition on my Android or Kindle Fire tablet": "feedback-form-tablet",
        "help with my Windows mobile news app": "feedback-form-windows",
        "Comment or query about an article": "feedback-form-editorial",
        "Questions about commenting/moderation/community": "feedback-form-discussion",
        "Other": "feedback-form-other"
    };

    console.log("Hiding stuff!");

    for(choice in fieldmap){

        // add option to dropdown

        var opt = document.createElement("option");
        opt.value = choice;
        opt.innerHTML = choice;
        select.appendChild(opt);

        // hide it

        try {
            document.getElementById(fieldmap[choice]).style.display = "none";
        } catch(err) {
            console.log("Failed to find " + choice)
        }

    }

    function flipflop(evt) {

        console.log("Flipping and flopping");

        var cat = document.getElementById("feedback-category").value

        for(choice in fieldmap){
            if(choice === cat){
                // show
                document.getElementById(fieldmap[choice]).style.display = "block";
            } else {
                // hide
                document.getElementById(fieldmap[choice]).style.display = "none";
            }
        }

    }

    document.getElementById("feedback-category").addEventListener("change", flipflop, false);

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

    };
});
