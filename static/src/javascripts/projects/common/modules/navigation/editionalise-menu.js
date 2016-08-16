define([
    'common/utils/fastdom-promise',
    'common/utils/$',
    'common/utils/config'
], function (
    fastdomPromise,
    $,
    config
) {

    function editionaliseMenu() {
        var edition = config.page.edition.toLowerCase();
        var editionLists = $('.js-editionlise-secondary-nav');

        // UK is our default edition so we don't have to change it
        if (edition !== 'uk') {

            editionLists.each(function (navList) {

                fastdomPromise.read(function() {

                    return navList.classList.contains('main-navigation__secondary--' + edition);

                }).then(function (isListCurrentEdition) {

                   fastdomPromise.write(function () {

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
