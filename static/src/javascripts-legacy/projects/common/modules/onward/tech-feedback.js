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
    var warning = document.getElementById("feedback__explainer");

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

    function toggleFormVisibility() {
        document.querySelectorAll("#feedback-category>option").forEach(function(elem){
            if(elem.selected && elem.value != "nothing"){
                document.getElementById(elem.value).classList.add("feedback__form--selected");
            } else if(elem.value != "nothing") {
                document.getElementById(elem.value).classList.remove("feedback__form--selected");
            }
        });
    }

    function mandatoryCheck(elem) {
        if(elem.value == ""){
            elem.classList.add("feedback__entry--mandatory-failed");
            return false;
        } else {
            elem.classList.remove("feedback__entry--mandatory-failed");
            return true;
        }
    }

    function initForms() {

        // mandatory checks (realtime)

        document.querySelectorAll(".feedback__form input,.feedback__form textarea").forEach((elem) => {
            elem.onblur = function(){ mandatoryCheck(elem); }
            elem.oninput = function(){ mandatoryCheck(elem); }
        });

        // mandatory checks (on submit)

        document.querySelectorAll(".feedback__form form").forEach((elem) => {
            elem.onsubmit = function() {

                var hasFailed = false;

                document.querySelectorAll(".feedback__form--selected input,.feedback__form--selected textarea").forEach((elem) => {
                    if(!mandatoryCheck(elem)){
                        hasFailed = true;
                    }
                });

                if(hasFailed){
                    warning.innerHTML = "All fields must be filled to proceed";
                }

                return !hasFailed;

            }

        });

        // form toggling

        document.getElementById("feedback-category").addEventListener("change", toggleFormVisibility, false);

        // insert hidden extra data into forms

        document.querySelectorAll(".feedback__form input[name=extra]").forEach(function(elem){
            elem.value = JSON.stringify(getExtraDataInformation());
        })

    }

    function hideUnenhancedFallback() {
        document.getElementById("feedback-form-default").remove();
    }

    return function () {

        detect.adblockInUse.then(function(adblockInUse){
            adblockBeingUsed = adblockInUse;
        });

        initForms();
        hideUnenhancedFallback();

    };

});
