// @flow
import { ABTestReportItem as ReportItem } from 'admin/modules/abtests/abtest-report-item';
import { Audience } from 'admin/modules/abtests/audience';
import {
    concurrentTests,
    epicTests,
    priorityEpicTest,
} from 'common/modules/experiments/ab-tests';
import { isExpired } from 'lib/time-utils';

const renderTests = (
    tests: $ReadOnlyArray<ABTest>,
    active: boolean,
    elem: ?Element
): Array<any> => {
    const items = tests.map(
        test =>
            new ReportItem({
                test,
                active,
            })
    );
    items.forEach(i => {
        i.render(elem);
    });
    return items;
};

const initABTests = (): void => {
    const tests = [].concat(concurrentTests, epicTests, [priorityEpicTest]);

    renderTests(
        tests.filter(test => !isExpired(test.expiry)),
        true,
        document.querySelector('.abtests-report__data')
    );

    const expiredTestItems = renderTests(
        concurrentTests.filter(test => isExpired(test.expiry)),
        false,
        document.querySelector('.abtests-expired')
    );

    // Display audience breakdown.
    const audience = new Audience({
        tests: concurrentTests.filter(test => !isExpired(test.expiry)),
    });
    audience.render(document.querySelector('.abtests-audience'));

    const expired = document.querySelector('.abtests-expired');

    const expiredTitle = document.querySelector('.abtests-expired-title a');

    if (expiredTitle) {
        expiredTitle.addEventListener('click', (e: Event) => {
            e.preventDefault();

            /**
                 #? textContent is a property of Node
                 flow won't allow typecasting of EventTarget
                 so typecasting as any
            * */
            const target = (e.target: any);

            if (target.textContent === 'show') {
                target.textContent = 'hide';
                if (expired) {
                    expired.style.display = 'block';
                }
                expiredTestItems.forEach(t => {
                    t.renderChart();
                });
            } else {
                target.textContent = 'show';
                if (expired) {
                    expired.style.display = 'none';
                }
            }
        });
    }

    if (expired) {
        // timeout on this to allow google charts to render before hiding the container
        setTimeout(() => {
            expired.style.display = 'none';
        }, 0);
    }
};

export { initABTests };
