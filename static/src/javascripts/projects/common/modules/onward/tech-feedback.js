// @flow

import $ from 'lib/$';
import { adblockInUse } from 'lib/detect';
import { getSynchronousParticipations as getABParticipations } from 'common/modules/experiments/ab';
import { getCookie } from 'lib/cookies';
import fetchJson from 'lib/fetch-json';

let adblockBeingUsed = false;
const DISABLED_ELEMENTS =
    '#feedback__form input, #feedback__form textarea, #feedback__form button';
const MANDATORY_ELEMENTS = '#feedback__form input, #feedback__form textarea';
const MEMBERS_DATA_API_ENDPOINT =
    'https://members-data-api.theguardian.com/user-attributes/me';

const summariseAbTests = (testParticipations: Participations): string => {
    const tests = Object.keys(testParticipations);

    if (tests.length === 0) {
        return 'No tests running';
    }

    return tests
        .map(testKey => {
            const test = testParticipations[testKey];
            return `${testKey}=${test.variant}`;
        })
        .join(', ');
};

const getBaseExtraData = (): Object => ({
    browser: window.navigator.userAgent,
    referrer: document.referrer,
    page: window.location,
    width: window.innerWidth,
    adBlock: adblockBeingUsed,
    devicePixelRatio: window.devicePixelRatio,
    gu_u: getCookie('GU_U'),
    payingMember: getCookie('gu_paying_member'),
    abTests: summariseAbTests(getABParticipations()),
});

const getExtraDataInformation = (): Promise<Object> =>
    fetchJson(MEMBERS_DATA_API_ENDPOINT, {
        mode: 'cors',
    })
        .then(membershipData => ({
            basicInformation: getBaseExtraData(),
            subscriptionInformation: membershipData,
        }))
        .catch(() => ({
            basicInformation: getBaseExtraData(),
        }));

const toggleFormVisibility = (evt: Event): void => {
    const evtTarget: HTMLInputElement = (evt.target: any);
    const SELECTED_CLASS = 'feedback__blurb--selected';

    // make the associated category blurb visible
    $.forEachElement('#feedback-category > option', elem => {
        if (elem.value !== 'nothing') {
            const target = document.getElementById(elem.value);

            if (target) {
                target.classList.toggle(SELECTED_CLASS, elem.selected);
            }
        }
    });

    // enable the form elements
    $.forEachElement(DISABLED_ELEMENTS, elem => {
        elem.disabled = evtTarget.value === 'nothing';
    });
};

const isInputFilled = (elem: HTMLInputElement): boolean => elem.value === '';

const initForms = (): Promise<any> => {
    const warning = document.getElementById('feedback__explainer');
    const feedback = document.getElementById('feedback-category');
    const onSubmitChecks = (elem: HTMLElement): void => {
        const onSubmit = () => {
            let hasFailed = false;

            $.forEachElement(MANDATORY_ELEMENTS, el => {
                if (!isInputFilled(el)) {
                    hasFailed = true;
                }
            });

            if (hasFailed && warning) {
                warning.innerHTML = 'All fields must be filled to proceed';
            }

            return !hasFailed;
        };

        elem.addEventListener('submit', onSubmit);
    };

    // mandatory checks (on submit)
    $.forEachElement('.feedback__form', onSubmitChecks);

    // set the form elements to disabled to begin with
    $.forEachElement(DISABLED_ELEMENTS, elem => {
        elem.disabled = true;
    });

    // form toggling
    if (feedback) {
        feedback.addEventListener('change', toggleFormVisibility, false);
    }

    // insert hidden extra data into forms

    return getExtraDataInformation().then(extraData => {
        $.forEachElement('#feedback__form input[name=extra]', elem => {
            elem.value = JSON.stringify(extraData, null, '  ');
        });
    });
};

const initTechFeedback = (): Promise<any> => {
    if (document.getElementById('feedback-category')) {
        adblockInUse.then(inUse => {
            adblockBeingUsed = inUse;
        });

        return initForms();
    }

    return Promise.resolve();
};

export { initTechFeedback };
