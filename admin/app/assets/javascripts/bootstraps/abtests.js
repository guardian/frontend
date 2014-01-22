define([
    'common/modules/experiments/ab',
    'qwery',
    'bean',
    'modules/abtests/participation',
    'modules/abtests/abtest-item'
], function(
    abTests,
    qwery,
    bean,
    Participation,
    Item
) {
    function renderTests(tests, active, elem){
        if (elem) {
            tests.forEach(function(test){
                new Item({test: test, active: active}).render(elem);
            });
        }
    }

    function initialise() {

        renderTests(abTests.getActiveTests(), true, qwery('.abtests-active'));
        renderTests(abTests.getExpiredTests(), false, qwery('.abtests-expired'));

        var $expired = qwery('.abtests-expired')[0];

        bean.on(qwery('.abtests-expired-title a')[0], 'click', function(e) {
            e.preventDefault();
            if (e.currentTarget.textContent == "show") {
                e.currentTarget.textContent = "hide";
                $expired.style.display = "block";
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
