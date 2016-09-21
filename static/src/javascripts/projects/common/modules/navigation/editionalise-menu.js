define([
    'fastdom',
    'qwery',
    'common/utils/config'
], function (
    fastdom,
    qwery,
    config
) {

    function editionaliseMenu() {
        var edition = config.page.edition.toLowerCase();
        var editionLists = qwery('.js-editionlise-secondary-nav');

        // UK is our default edition so we don't have to change it
        if (edition !== 'uk') {

            editionLists.forEach(function (navList) {

                fastdom.read(function() {
                    var isListCurrentEdition = (navList.getAttribute('data-edition') === edition);

                    fastdom.write(function () {
                        if (isListCurrentEdition) {
                            navList.removeAttribute('hidden');
                        } else {
                            navList.setAttribute('hidden', '');
                        }
                    });
                });
            });
        }
    }
    return editionaliseMenu;
});
