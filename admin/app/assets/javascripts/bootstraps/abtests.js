define([
    'common/modules/experiments/ab',
    'qwery',
    'bean',
    'modules/abtests/abtest-item',
    'modules/abtests/audience'
], function(
    abTests,
    qwery,
    bean,
    Item,
    Audience
) {
    function renderTests(tests, active, elem){
        var items = tests.map(function(test){ return new Item({test: test, active: active}); });
        items.forEach(function(i) { i.render(elem); });
        return items;
    }

    function initialise() {

        renderTests(abTests.getActiveTests(), true, qwery('.abtests-active'));
        var expiredTests = renderTests(abTests.getExpiredTests(), false, qwery('.abtests-expired'));

        // Display audience breakdown.
        var audience = new Audience({tests: abTests.getActiveTests()});
        audience.render(qwery('.abtests-audience'));

        var $expired = qwery('.abtests-expired')[0];

        bean.on(qwery('.abtests-expired-title a')[0], 'click', function(e) {
            e.preventDefault();
            if (e.currentTarget.textContent == "show") {
                e.currentTarget.textContent = "hide";
                $expired.style.display = "block";
                expiredTests.forEach(function(t){t.renderChart();});
            } else {
                e.currentTarget.textContent = "show";
                $expired.style.display = "none";
            }
        });

        // timeout on this to allow google charts to render before hiding the container
        setTimeout(function() { $expired.style.display = 'none'; }, 0);
    }

    return {
        init: initialise
    };
});
