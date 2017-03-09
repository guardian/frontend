import template from 'lodash/utilities/template';
import storage from 'lib/storage';
import $ from 'lib/$';
import bean from 'bean';
import find from 'lodash/collections/find';
import overlay from 'raw-loader!common/views/devtools/overlay.html';
import styles from 'raw-loader!common/views/devtools/styles.css';
import getAbTests from 'common/modules/experiments/get-ab-tests';

function getSelectedAbTests() {
    return JSON.parse(storage.local.get('gu.devtools.ab')) || [];
}

function bindEvents() {
    $('.js-devtools-force-ab').each(label => {
        bean.on(label, 'click', () => {
            const testId = label.getAttribute('data-ab-test');
            const variantId = label.getAttribute('data-ab-variant');
            const abTests = getSelectedAbTests();
            const existingVariantForThisTest = find(abTests, { id: testId });

            if (existingVariantForThisTest) {
                existingVariantForThisTest.variant = variantId;
            } else {
                abTests.push({id: testId, variant: variantId});
            }
            storage.local.set('gu.devtools.ab', JSON.stringify(abTests));
        });
    });
}

function selectRadios() {
    const abTests = getSelectedAbTests();

    abTests.forEach((test) => {
       $(`#${test.id}-${test.variant}`).attr('checked', true);
    });
}

function applyCss() {
    const el = $.create('<style type="text/css"></style>');

    el.append(styles);
    $('head').append(el);
}

function appendOverlay() {
    const header = $('body');
    const tests = getAbTests();
    const data = {
        tests: tests.map(test => ({ id: test.id, variants: test.variants })),
    };

    header.prepend(template(overlay, data));
}

export default function showDevTools() {
    appendOverlay();
    bindEvents();
    selectRadios();
    applyCss();
}
