// @flow
import template from 'lodash/utilities/template';
import { local as storage } from 'lib/storage';
import $ from 'lib/$';
import bean from 'bean';
import overlay from 'raw-loader!common/views/devtools/overlay.html';
import styles from 'raw-loader!common/views/devtools/styles.css';
import { TESTS } from 'common/modules/experiments/ab-tests';

const getSelectedAbTests = () =>
    JSON.parse(storage.get('gu.devtools.ab')) || [];

const selectRadios = () => {
    const abTests = getSelectedAbTests();

    $('.js-devtools-radio').each(radio => {
        $(radio).attr('checked', false);
    });

    abTests.forEach(test => {
        $(`#${test.variantId}-${test.variantId}`).attr('checked', true);
    });
};

const bindEvents = () => {
    $('.js-devtools-force-ab').each(label => {
        bean.on(label, 'click', () => {
            const testId = label.getAttribute('data-ab-test');
            const variantId = label.getAttribute('data-ab-variant');
            const abTests = getSelectedAbTests();
            const existingVariantForThisTest = abTests.find(
                test => test.testId === testId
            );

            if (existingVariantForThisTest) {
                existingVariantForThisTest.variantId = variantId;
            } else {
                abTests.push({ testId, variantId });
            }
            storage.set('gu.devtools.ab', JSON.stringify(abTests));
        });
    });

    bean.on($('.js-devtools-clear-ab')[0], 'click', () => {
        storage.set('gu.devtools.ab', JSON.stringify([]));
        selectRadios();
    });

    bean.on($('.js-devtools-reload')[0], 'click', () => {
        window.location.reload();
    });

    bean.on($('.js-devtools-toggle')[0], 'click', () => {
        const toggleButton = $('.js-devtools-toggle');

        if (toggleButton.text() === 'X') {
            toggleButton.text('>');
        } else {
            toggleButton.text('X');
        }
        $('.devtools').toggleClass('devtools--hidden');
    });
};

const applyCss = () => {
    const el = $.create('<style type="text/css"></style>');

    el.append(styles);
    $('head').append(el);
};

const appendOverlay = () => {
    const data = {
        tests: TESTS.map(test => ({
            id: test.id,
            variants: test.variants,
        })),
    };

    $('body').prepend(template(overlay, data));
};

export const showDevTools = () => {
    appendOverlay();
    bindEvents();
    selectRadios();
    applyCss();
};
