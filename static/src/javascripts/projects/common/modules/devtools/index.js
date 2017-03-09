import template from 'lodash/utilities/template';
import storage from 'lib/storage';
import $ from 'lib/$';
import bean from 'bean';
import overlay from 'raw-loader!common/views/devtools/overlay.html';
import getAbTests from 'common/modules/experiments/get-ab-tests';

function bindEvents() {
    $('.js-devtools-force-ab').each(label => {
        bean.on(label, 'click', () => {
            const testId = label.getAttribute('data-ab-test');
            const variantId = label.getAttribute('data-ab-variant');
            const abTests = JSON.parse(storage.local.get('gu.devtools.ab')) || [];

            abTests.push({id: testId, variant: variantId});
            storage.local.set('gu.devtools.ab', JSON.stringify(abTests));
        });
    });
}

export default function showDevTools() {
    const header = $('#bannerandheader');
    const tests = getAbTests();
    const data = {
        tests: tests.map(test => ({ id: test.id, variants: test.variants })),
    };
    console.log(tests);

    header.append(template(overlay, data));
    bindEvents();
}
