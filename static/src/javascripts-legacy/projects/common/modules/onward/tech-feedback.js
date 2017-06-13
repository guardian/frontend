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

    function toggleFormVisibility(evt) {

        // make the associated category blurb visible

        $.forEachElement("#feedback-category>option", function(elem){
            if(elem.selected && elem.value !== "nothing"){
                document.getElementById(elem.value).classList.add("feedback__blurb--selected");
            } else if(elem.value !== "nothing") {
                document.getElementById(elem.value).classList.remove("feedback__blurb--selected");
            }
        });

        // enable the form elements

        $.forEachElement("#feedback__form input,#feedback__form textarea,#feedback__form button", function (elem) {
            elem.disabled = evt.target.value == "nothing"
        });

    }

    function isInputFilled(elem) {
        return elem.value === "";
    }

    function initForms() {

        var warning = document.getElementById("feedback__explainer");

        // mandatory checks (on submit)

        $.forEachElement(".feedback__form", function(elem){
            elem.addEventListener("submit", function() {

                var hasFailed = false;

                $.forEachElement("#feedback__form input,#feedback__form textarea", function(elem){
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

        // set the form elements to disabled to begin with

        $.forEachElement("#feedback__form input,#feedback__form textarea,#feedback__form button", function(elem){
            elem.disabled = true;
        });

        // form toggling

        document.getElementById("feedback-category").addEventListener("change", toggleFormVisibility, false);

        // insert hidden extra data into forms

        $.forEachElement("#feedback__form input[name=extra]", function(elem){
            elem.value = JSON.stringify(getExtraDataInformation());
        })

    }

    return function () {

        if(document.getElementById("feedback-category")){

            detect.adblockInUse.then(function(adblockInUse){
                adblockBeingUsed = adblockInUse;
            });

            initForms();

        }

    };

});
