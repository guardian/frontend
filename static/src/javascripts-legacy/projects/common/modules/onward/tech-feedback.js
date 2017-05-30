define([
    'bean',
    'lib/$',
    'lib/config',
    'lib/detect',
    'commercial/modules/dfp/get-creative-ids',
    'common/modules/experiments/utils',
    'lodash/collections/map',
    'lodash/collections/reduce',
    'lodash/objects/assign',
    'lodash/objects/keys',
    'lib/cookies'
], function (
    bean,
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

    var adblockBeingUsed = false;

    function getExtraDataInformation() {
        return {
            browser: window.navigator.userAgent,
            page: window.location,
            width: window.innerWidth,
            adBlock: adblockBeingUsed,
            devicePixelRatio: window.devicePixelRatio,
            gu_u: cookies.getCookie('GU_U'),
            payingMember: cookies.getCookie('gu_paying_member'),
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

        $.forEachElement("#feedback-category>option", function(elem){
            if(elem.selected && elem.value !== "nothing"){
                document.getElementById(elem.value).classList.add("feedback__form--selected");
            } else if(elem.value !== "nothing") {
                document.getElementById(elem.value).classList.remove("feedback__form--selected");
            }
        });
    }

    function isInputFilled(elem) {
        return elem.value === "";
    }

    function initForms() {

        var warning = document.getElementById("feedback__explainer");

        // mandatory checks (realtime)

        function toggleMandatoryOutline(elem) {
            if(isInputFilled(elem)){
                elem.classList.add("feedback__entry--mandatory-failed");
            } else {
                elem.classList.remove("feedback__entry--mandatory-failed");
            }
        }

        $.forEachElement(".feedback__form input,.feedback__form textarea", function(elem){
            elem.addEventListener("blur", function(){ toggleMandatoryOutline(elem); });
            elem.addEventListener("input", function(){ toggleMandatoryOutline(elem); });
        });

        // mandatory checks (on submit)

        $.forEachElement(".feedback__form form", function(elem){
            elem.addEventListener("submit", function() {

                var hasFailed = false;

                $.forEachElement(".feedback__form--selected input,.feedback__form--selected textarea", function(elem){
                    if(!isInputFilled(elem)){
                        hasFailed = true;
                    }
                });

                if(hasFailed){
                    warning.innerHTML = "All fields must be filled to proceed";
                }

                return !hasFailed;

            });
        });

        // form toggling

        document.getElementById("feedback-category").addEventListener("change", toggleFormVisibility, false);

        // insert hidden extra data into forms

        $.forEachElement(".feedback__form input[name=extra]", function(elem){
            elem.value = JSON.stringify(getExtraDataInformation());
        })

    }

    function hideUnenhancedFallback() {
        document.getElementById("feedback-form-default").remove();
    }

    return function () {

        if(document.getElementById("feedback-category")){

            detect.adblockInUse.then(function(adblockInUse){
                adblockBeingUsed = adblockInUse;
            });

            initForms();
            hideUnenhancedFallback();
            
        }

    };

});
