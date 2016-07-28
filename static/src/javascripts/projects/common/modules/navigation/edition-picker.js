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

        button.addClass('edition-picker__button js-click');
        button.attr('id', 'edition-picker');
        button.attr('aria-controls', 'edition-picker__dropdown');
        button.attr('aria-expanded', 'true');

        fastdomPromise.write(function() {
            checkBox.remove();
            container.prepend(button);

            openMenuOnClick();
        });
    }

    function openMenuOnClick() {
        var button = $('.js-click');

        if (button.length > 0) {
            button[0].addEventListener('click', function() {

                fastdomPromise.write(function() {
                    if (button.hasClass('open')) {
                        button.removeClass('open');
                        dropdown.attr('hidden');
                    } else {
                        button.addClass('open');
                        dropdown.removeAttr('hidden');
                    }
                });
            });
        }
    }

    function clickMenuOnEnter() {
        var label = document.getElementsByClassName('js-on-enter-click')[0];

        if (label) {
            label.onkeypress =  function clickOnEnter(event) {
                if((event.keyCode ? event.keyCode : event.which) == 13) {
                    fastdomPromise.write(function() {
                        label.click();
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
