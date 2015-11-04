define([
    'common/modules/experiments/ab',
    'qwery',
    'bean',
    'admin/modules/abtests/abtest-report',
    'admin/modules/abtests/abtest-report-item',
    'admin/modules/abtests/audience'
], function (
    abTests,
    qwery,
    bean,
    Report,
    ReportItem,
    Audience
) {
    function renderTests(tests, active, elem) {
        var items = tests.map(function (test) { return new ReportItem({test: test, active: active}); });
        items.forEach(function (i) { i.render(elem); });
        return items;
    }

    function initialise() {

        renderTests(abTests.getActiveTests(), true, qwery('.abtests-report__data'));
        var expiredTestItems = renderTests(abTests.getExpiredTests(), false, qwery('.abtests-expired'));

        // Display audience breakdown.
        var audience = new Audience({tests: abTests.getActiveTests()});
        audience.render(qwery('.abtests-audience'));

        var $expired = qwery('.abtests-expired')[0];

        bean.on(qwery('.abtests-expired-title a')[0], 'click', function (e) {
            e.preventDefault();
            if (e.currentTarget.textContent === 'show') {
                e.currentTarget.textContent = 'hide';
                $expired.style.display = 'block';
                expiredTestItems.forEach(function (t) {t.renderChart(); });
            } else {
                e.currentTarget.textContent = 'show';
                $expired.style.display = 'none';
            }
        });

        // timeout on this to allow google charts to render before hiding the container
        setTimeout(function () { $expired.style.display = 'none'; }, 0);
    }

    return {
        init: initialise
    };
});
