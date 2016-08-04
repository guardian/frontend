define([
    'common/utils/fastdom-promise',
    'common/utils/$'
], function (
    fastdomPromise,
    $
) {
    var dropdown = $('.js-edition-picker-dropdown');

    function enhanceToButton() {
        var container = $('.js-edition-picker-container');
        var checkBox = $('.js-enhance-checkbox');
        var button = $.create('<button>');

        button.addClass('edition-picker__button js-open-edition-picker');
        button.attr('id', 'edition-picker');
        button.attr('aria-controls', 'edition-picker__dropdown');
        button.attr('aria-expanded', 'false');

        fastdomPromise.write(function() {
            checkBox.remove();
            container.prepend(button);

            openMenuOnClick();
        });
    }

    function openMenuOnClick() {
        var button = $('.js-open-edition-picker');

        if (button.length > 0) {
            button[0].addEventListener('click', function() {

                fastdomPromise.write(function() {
                    if (button.hasClass('open')) {
                        button.removeClass('open');
                        button.attr('aria-expanded', 'false');
                        dropdown.attr('hidden', '');
                    } else {
                        button.addClass('open');
                        button.attr('aria-expanded', 'true');
                        dropdown.removeAttr('hidden');
                    }
                });
            });
        }
    }

    function clickMenuOnEnter() {
        var label = document.getElementsByClassName('js-on-enter-click');

        if (label.length > 0) {
            label[0].onkeypress =  function clickOnEnter(event) {
                if((event.keyCode ? event.keyCode : event.which) === 13) {
                    fastdomPromise.write(function() {
                        label[0].click();
                    });
                }
            };
        }
    }

    function init() {
        clickMenuOnEnter();
        enhanceToButton();
    }

    return init;
});
