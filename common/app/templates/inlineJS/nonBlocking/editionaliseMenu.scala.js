@()

(function (window) {
    var edition = window.guardian.config.page.edition.toLowerCase();
    var editionLists = Array.prototype.slice.call(document.getElementsByClassName('js-editionalise-secondary-nav'));

    // UK is our default edition so we don't have to change it
    if (edition !== 'uk') {
        editionLists.forEach(function (navList) {
            var isListCurrentEdition = (navList.getAttribute('data-edition') === edition);

            if (isListCurrentEdition) {
                navList.removeAttribute('hidden');
            } else {
                navList.setAttribute('hidden', '');
            }
        });
    }
})(window);
