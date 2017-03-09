import template from 'lodash/utilities/template';
import $ from 'lib/$';
import overlay from 'raw-loader!common/views/devtools/overlay.html';
import getAbTests from 'common/modules/experiments/get-ab-tests';

export default function showDevTools() {
    const header = $('#bannerandheader');
    const tests = getAbTests();
    const data = {
        tests: tests.map(test => ({ id: test.id, variants: test.variants })),
    };
    console.log(tests);

    header.append(template(overlay, data));
}
