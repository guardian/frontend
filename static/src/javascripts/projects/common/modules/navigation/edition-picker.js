define([
    'fastdom',
    'qwery'
], function (
    fastdom,
    qwery
) {
    function editionPickerClickHandler(event) {
        event.stopPropagation();
        var button = event.target;
        var editionPickerDropdown = qwery('.js-edition-picker-dropdown')[0];

        function menuIsOpen() {
            return button.getAttribute('aria-expanded') === 'true';
        }

        function closeEditionPickerAndRemoveListener() {
            closeMenu();
            document.removeEventListener('click', closeEditionPickerAndRemoveListener, false);
        }

        function closeMenu() {
            fastdom.write(function () {
                button.setAttribute('aria-expanded', 'false');
                if (editionPickerDropdown) {
                    editionPickerDropdown.setAttribute('aria-hidden', 'true');
                }
            });
        }

        if (menuIsOpen()) {
            closeEditionPickerAndRemoveListener();
        } else {
            fastdom.write(function () {
                button.setAttribute('aria-expanded', 'true');
                if (editionPickerDropdown) {
                    editionPickerDropdown.setAttribute('aria-hidden', 'false');
                }
                document.addEventListener('click', closeEditionPickerAndRemoveListener, false);
            });
        }
    }

    return editionPickerClickHandler;
});
