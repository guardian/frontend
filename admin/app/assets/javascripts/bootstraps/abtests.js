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

    function render() {
        renderTests(abTests.getActiveTests(), true, qwery('.abtests-active'));
        renderTests(abTests.getExpiredTests(), false, qwery('.abtests-expired'));

        bean.on(qwery('.abtests-expired-title a')[0], 'click', function(e) {
            e.preventDefault();
            var $expired = qwery('.abtests-expired')[0];
            if (e.currentTarget.textContent == "show") {
                e.currentTarget.textContent = "hide";
                $expired.style.display = "block";
            } else {
                e.currentTarget.textContent = "show";
                $expired.style.display = "none";
            }
        });
    }

    function initialise() {
        render();
        // timeout on this to allow google charts to render before hiding the container
        setTimeout(function() {
            bean.fire(qwery('.abtests-expired-title a')[0], 'click');
        }, 0);
    }

    return {
        init: initialise
    };
});
