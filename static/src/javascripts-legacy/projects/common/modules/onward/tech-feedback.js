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

    var select = document.getElementById("feedback-category");
    var warning = document.getElementById("feedback-warning");

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

    var adblockBeingUsed = false;

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

    function addOptionsToSelectDropDown() {
        for(choice in fieldmap){
            var opt = document.createElement("option");
            opt.value = choice;
            opt.innerHTML = choice;
            select.appendChild(opt);
        }
    }

    function toggleFormVisibility() {

        var cat = document.getElementById("feedback-category").value;

        for(choice in fieldmap){
            if(choice === cat){
                document.getElementById(fieldmap[choice]).classList.add("feedback__form-selected");
            } else {
                document.getElementById(fieldmap[choice]).classList.remove("feedback__form-selected");
            }
        }

    }

    function mandatoryCheck(elem) {
        if(elem.value == ""){
            elem.classList.add("mandatory-failed");
            return false;
        } else {
            elem.classList.remove("mandatory-failed");
            return true;
        }
    }

    function initForms() {

        document.querySelectorAll(".feedback__form input,.feedback__form textarea").forEach((elem) => {
            elem.onblur = function(){ mandatoryCheck(elem); }
            elem.oninput = function(){ mandatoryCheck(elem); }
        });

        document.querySelectorAll(".feedback__form form").forEach((elem) => {
            elem.onsubmit = function() {

                var hasFailed = false;

                document.querySelectorAll(".feedback__form-selected input,.feedback__form-selected textarea").forEach((elem) => {
                    if(!mandatoryCheck(elem)){
                        hasFailed = true;
                    }
                });

                if(hasFailed){
                    console.log("Mandatory check failed. Not proceeding with form submission.");
                    warning.innerHTML = "All fields must be filled to proceed";
                }

                return !hasFailed;

            }

        });

        document.getElementById("feedback-category").addEventListener("change", toggleFormVisibility, false);

    }

    return function () {

        detect.adblockInUse.then(function(adblockInUse){
            adblockBeingUsed = adblockInUse;
        });

        console.log(getExtraDataInformation());

        addOptionsToSelectDropDown();
        initForms();

    };

});
